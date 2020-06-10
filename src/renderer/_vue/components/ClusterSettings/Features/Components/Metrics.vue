<template>
  <div class="settings-section">
    <b>Metrics</b>
    <p class="description">
      Enable timeseries data visualization (Prometheus stack) for your cluster. Install this only if you don't have existing Prometheus stack installed. You can see preview of manifests <a href="https://github.com/lensapp/lens/tree/master/src/features/metrics">here</a>.
    </p>
    <div class="actions">
      <b-button @click="install" v-if="!settings.installed" :disabled="!cluster.isAdmin || isProcessing || !canInstall" variant="primary">
        <b-spinner small v-if="isProcessing" label="Small Spinner" />
        Install
      </b-button>
      <b-button @click="upgrade" v-if="isUpgradeAvailable" :disabled="!cluster.isAdmin || isProcessing || isUpgrading" variant="primary">
        <b-spinner small v-if="isUpgrading" label="Small Spinner" />
        Upgrade
      </b-button>
      <b-button @click="uninstall" v-if="settings.installed" :disabled="!cluster.isAdmin || isProcessing || isUpgrading" variant="danger">
        <b-spinner small v-if="isProcessing" label="Small Spinner" />
        Uninstall
      </b-button>
      <b-alert show variant="danger" v-if="status === 'ERROR'">
        {{ errorMsg }}
      </b-alert>
    </div>
  </div>
</template>

<script>
const semver = require('semver');

export default {
  name: 'Metrics',
  components: {},
  props: {
    cluster: {
      type: Object,
      required: true,
      default: null
    },
    feature: {
      type: String,
      required: true,
      default: null
    },
    settings: {
      type: Object,
      required: false,
      default: Object
    }
  },
  data(){
    return {
      status: "",
      errorMsg: "",
    }
  },
  computed:{
    isUpgradeAvailable: function() {
      return this.cluster.features.metrics.canUpgrade;
    },
    isProcessing: function() {
      return this.status === "PROCESSING";
    },
    isUpgrading: function() {
      return this.status === "UPGRADING";
    },
    canInstall: function() {
      return !this.cluster.preferences.prometheus
    }
  },
  methods: {
    install: async function(){
      this.status="PROCESSING";
      let error = null;
      let result = await this.$store.dispatch("installClusterFeature", {
        name: this.feature,
        clusterId: this.cluster.id,
        config: null,
      }).catch(e => {
        error = e;
        return false; // just returning false to promise
      })

      // handle exceptions here; but oh why, why do we have to???
      if(error){
        this.status = "ERROR";
        this.errorMsg = error;
        return false;
      }

      // now let's look at result...
      if(result.success === false) {
        this.status = "ERROR"
        this.errorMsg = result.message
      } else {
        this.$store.dispatch("refineCluster", this.cluster.id);
        this.status = "";
        this.errorMsg = "";
      }
    },
    uninstall: async function(){
      this.status = "PROCESSING";
      let error = null;
      try {
        let result = await this.$store.dispatch("uninstallClusterFeature", {
          name: this.feature,
          clusterId: this.cluster.id,
        })
        console.log("uninstall result:", result);
        this.$store.dispatch("refineCluster", this.cluster.id);
        this.status = "SUCCESS";
        this.errorMsg = "";
      } catch(error) {
        this.status = "ERROR"
        this.errorMsg = error
        console.log("Error uninstalling:", error);
      }

      return true;
    },
    upgrade: async function(){
      this.status = "UPGRADING";
      try {
        let result = await this.$store.dispatch("upgradeClusterFeature", {
          name: this.feature,
          clusterId: this.cluster.id,
          config: null,
        })
        this.$store.dispatch("refineCluster", this.cluster.id);
        this.status = "";
        this.errorMsg = "";
      } catch(error) {
        this.status = "ERROR"
        this.errorMsg = error.message
      }
      return true;
    },
  }
}
</script>
<style scoped lang="scss">
</style>

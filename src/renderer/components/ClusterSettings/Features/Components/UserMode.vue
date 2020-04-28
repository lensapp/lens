<template>
  <div class="settings-section">
    <b>User Mode</b>
    <p class="description">
      User Mode feature enables non-admin users to see namespaces they have access to. This is achieved by configuring RBAC rules so that every authenticated user is granted to list namespaces.
    </p>
    <div class="actions">
      <b-button @click="install" v-if="!settings.installed" :disabled="!cluster.isAdmin || isProcessing" variant="primary">
        <b-spinner small v-if="isProcessing" label="Small Spinner" />
        Install
      </b-button>
      <b-button @click="uninstall" v-if="settings.installed" :disabled="!cluster.isAdmin || isProcessing" variant="danger">
        <b-spinner small v-if="isProcessing" label="Small Spinner" />
        Uninstall
      </b-button>
      <b-button @click="upgrade" v-if="isUpgradeAvailable" :disabled="!cluster.isAdmin" variant="primary">
        Upgrade
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
  name: 'UserMode',
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
    isProcessing: function() {
      return this.status === "PROCESSING";
    },
    isUpgradeAvailable: function() {
      if(!this.settings.installed) return false;
      if(!this.settings.currentVersion) return false;
      if(!this.settings.latestVersion) return false;
      let currentVersion = (this.settings.currentVersion.charAt(0) === "v") ? this.settings.currentVersion.substr(1) : this.settings.currentVersion;
      let latestVersion = (this.settings.latestVersion.charAt(0) === "v") ? this.settings.latestVersion.substr(1) : this.settings.latestVersion;
      return semver.gt(latestVersion, currentVersion)
    },
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
      this.status="PROCESSING";
      let error = null;
      try {
        let result = await this.$store.dispatch("uninstallClusterFeature", {
          name: this.feature,
          clusterId: this.cluster.id,
        })
        console.log("uninstall result:", result);
        this.$store.dispatch("refineCluster", this.cluster.id);
        this.status="SUCCESS";
        this.errorMsg = "";
      } catch(error) {
        this.status = "ERROR"
        this.errorMsg = error
        console.log("Error uninstalling:", error);
      }

      return true;

    },
    upgrade: async function(){
      // todo
      return true;

    },
  }
}
</script>
<style scoped lang="scss">
</style>

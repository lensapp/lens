<template>
  <div class="content">
    <ClosePageButton />
    <div class="container-fluid settings">
      <div v-if="cluster" class="header sticky-top">
        <h2>
          <div class="icon d-inline">
            <img v-if="preferences.icon" :src="preferences.icon" class="cluster-icon">
            <hashicon v-else :name="cluster.preferences.clusterName" size="30" />
          </div>
          {{ cluster.preferences.clusterName }}
        </h2>
      </div>
      <div v-if="cluster" class="row">
        <div class="col-3" />
        <div ref="content" id="cluster-settings" class="col-6">
          <cluster-settings-overview :cluster="cluster" />
          <cluster-settings-general :cluster="cluster" />
          <cluster-settings-preferences :cluster="cluster" />
          <cluster-settings-features :cluster="cluster" />

          <div id="cluster-remove" class="settings-section">
            <h2>Remove Cluster</h2>
            <b-button v-b-modal.bv-modal-confirm variant="danger" type="submit">
              Remove Cluster
            </b-button>
            <!-- Modal confirmation -->
            <b-modal id="bv-modal-confirm" @ok="removeCluster" ok-title="Remove" ok-variant="danger" title-class="confirm-header" hide-backdrop title="Confirm cluster delete">
              <p>Are you sure you want to delete <strong>{{ preferences.clusterName }}</strong> cluster from Lens?</p>
            </b-modal>
          </div>
        </div>
      </div>
      <div v-if="!cluster">
        <cube-spinner text="Loading..." />
      </div>
    </div>
  </div>
</template>

<script>
import CubeSpinner from "@/_vue/components/CubeSpinner";
import ClusterSettingsGeneral from "./General/index";
import ClusterSettingsOverview from "./Overview/index";
import ClusterSettingsPreferences from "./Preferences/index";
import ClusterSettingsFeatures from "./Features/index";
import hashicon from "../hashicon/hashicon";
import ClosePageButton from "@/_vue/components/common/ClosePageButton";

export default {
  name: 'ClusterSettingsPage',
  components: {
    CubeSpinner,
    ClosePageButton,
    ClusterSettingsGeneral,
    ClusterSettingsOverview,
    ClusterSettingsPreferences,
    ClusterSettingsFeatures,
    hashicon
  },
  computed: {
    cluster: function() {
      return this.$store.getters.clusterById(this.$route.params.id);
    },
    preferences: function() {
      return this.cluster.preferences;
    }
  },
  methods: {
    loadLens: function() {
      this.$store.dispatch("refineCluster", this.cluster.id);
    },
    removeCluster: async function(){
      let res = await this.$store.dispatch('removeCluster', this.cluster.id);
      if(!res) return false;

      this.$router.push({
        name: "landing-page"
      }).catch(err => {})
      return true;
    },
  },
  created() {
    this.loadLens()
  },
  watch: {
    "$route": "loadLens"
  }
}
</script>

<style lang="scss">
  .header {
    & h2 {
      padding: 0.5rem
    }
    padding-top: 5px;
    padding-left: 15px;
    border-bottom: 1px solid rgb(53, 58, 62);
    background-color: #1e2124;
    & img {
      margin-right: 10px;
      height: 35px;
    }
    .hashicon {
      position: relative;
      height: 40px;
      margin-right: 10px;
      & canvas{
        position: relative;
        bottom: -6px;
      }
    }
  }

  .settings {
    height: 100%;
    overflow-y: scroll;
  }
  .settings-section {
    margin-bottom: 20px;
  }

  #cluster-settings {
    & input {
      background-color: #252729 !important;
      border: 0px !important;
      color: #87909c !important;
    }
  }

  .cluster-icon {
    width: 38px;
  }

  h2{
    padding: 0.75rem;
    padding-left: 0px;
  }

  .table th, .table td{
    padding-bottom: 0px !important;
  }

  .custom-select {
    -webkit-appearance: inherit;
  }

  .collapsed > .when-opened, :not(.collapsed) > .when-closed {
      display: none;
  }

  .confirm-header{
    color: #dc3545;
  }

  .navbar {
    align-items: flex-start !important;
  }

  .nav-link {
    padding: 0px !important;
    &.active {
      color: white;
    }
  }

  .custom-file-label{
    background: transparent !important;
    color: #3d90ce !important;
  }

  .was-validated .custom-file-input:invalid ~ .custom-file-label, .custom-file-input.is-invalid ~ .custom-file-label {
    border-color: transparent !important;
  }

  .custom-file-label::after {
    content: "" !important;
    width: 0px;
    padding: 0px !important;
    background-color: transparent !important;
    cursor: pointer;
  }

</style>

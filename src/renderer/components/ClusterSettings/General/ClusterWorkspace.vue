<template>
  <div class="settings-section">
    <b>Cluster Workspace</b>
    <p>
      Define cluster <a href="/#/workspaces">workspace</a>.
    </p>
    <b-form-select
      v-model="cluster.workspace"
      :options="workspaces"
      @change="onSave"
    />
  </div>
</template>

<script>
export default {
  name: 'ClusterWorkspace',
  props: {
    cluster: {
      type: Object,
      required: true,
      default: null
    }
  },
  computed: {
    workspaces: function() {
      return this.$store.getters.workspaces.map((ws) => {
        return {
          value: ws.id,
          text: ws.name
        }
      });
    }
  },
  methods: {
    onSave: async function(workspaceId) {
      this.cluster.workspace = workspaceId
      await this.$store.dispatch("storeCluster", this.cluster);
      const ws = this.$store.getters.workspaceById(this.cluster.workspace);
      if (ws) {
        this.$store.commit("setCurrentWorkspace", ws);
        await this.$store.dispatch("clearClusters");
        await this.$store.dispatch("refreshClusters", ws);
      }
    }
  }
}
</script>

<style>

</style>

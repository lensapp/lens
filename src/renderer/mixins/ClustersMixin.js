export default {
  computed: {
    clusters: function() {
      return this.$store.getters.clusters
    },
    newContexts: function() {
      const seenContexts = this.seenContexts || this.$store.getters.seenContexts
      const contextNamesFromKubeconfig = this.availableContexts.map(item => item.currentContext)
      return contextNamesFromKubeconfig.filter((item) => seenContexts.indexOf(item) < 0)
    },
    availableContexts: function() {
      // read available kubeconfigs from store on filter out configs already found in added clusters
      return this.$store.getters.availableKubeContexts.filter(item => !this.clusters.find((cluster) => cluster.contextName == item.currentContext));
    },
  }
}

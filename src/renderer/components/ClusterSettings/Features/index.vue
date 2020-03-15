<template>
  <div id="cluster-features" class="row">
    <div class="col-12">
      <h2>Features</h2>
      <component
        v-for="featureName in features"
        :key="featureName"
        :is="featureName"
        :cluster="cluster"
        :feature="featureName"
        :settings="feature(featureName)"
      />
    </div>
  </div>
</template>

<script>
// register all sub components
import components from './Components'

export default {
  name: 'ClusterFeatures',
  components: components,
  props: {
    cluster: {
      type: Object,
      default: null,
    }
  },
  data(){
    return {
    }
  },
  computed:{
    features: function() {
      if (!this.cluster) return []
      if (!this.cluster.features) return []

      return Object.keys(this.cluster.features)
    }
  },
  methods: {
    feature: function( name ){ return this.cluster.features[name] }
  }
}
</script>
<style scoped lang="scss">
h2{
  margin-top: 20px;
}
</style>

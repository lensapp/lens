<template>
  <div class="settings-section">
    <b>Cluster Name</b>
    <p>
      Define cluster name.
    </p>
    <b-form-input v-model="cluster.preferences.clusterName"
                  :placeholder="cluster.preferences.clusterName"
                  :state="errors.name"
                  trim
                  @blur="onSave"
    />
  </div>
</template>

<script>
export default {
  name: 'ClusterName',
  props: {
    cluster: {
      type: Object,
      required: true,
      default: null
    }
  },
  data(){
    return {
      errors: {
        name: null
      }
    }
  },
  methods: {
    onSave: function() {
      if(this.cluster.preferences.clusterName === "") {
        this.errors.name = false
        return
      } else {
        this.errors.name = true
      }
      this.$store.dispatch("storeCluster", this.cluster);
    }
  }
}
</script>

<style>

</style>

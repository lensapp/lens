<template>
  <div id="cluster-general" class="row">
    <div class="col-12">
      <h2>General</h2>
      <cluster-name :cluster="cluster" />
      <cluster-workspace :cluster="cluster" />
      <cluster-icon :cluster="cluster" />
    </div>
  </div>
</template>

<script>
import ClusterIcon from "./ClusterIcon";
import ClusterName from "./ClusterName"
import ClusterWorkspace from "./ClusterWorkspace"
export default {
  name: "ClusterSettingsGeneral",
  props: {
    cluster: {
      type: Object,
      required: true,
      default: null
    }
  },
  components: {
    ClusterIcon,
    ClusterName,
    ClusterWorkspace
  }
}
</script>

<style>

</style>

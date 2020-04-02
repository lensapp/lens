<template>
  <div id="cluster-status" class="cluster-settings-overview row">
    <div class="col-12">
      <h2>Status</h2>
      <div class="settings-section">
        <b>Cluster Status</b>
        <p>
          Cluster status information including detected distribution, kernel version and online status
        </p>

        <table class="table">
          <tbody>
            <tr>
              <th scope="row">
                Online Status
              </th>
              <td>{{ cluster.online ? "online" : "offline (" + (cluster.failureReason || "unknown reason") + ")" }}</td>
            </tr>
            <tr>
              <th scope="row">
                Distribution
              </th>
              <td>{{ cluster.distribution }}</td>
            </tr>
            <tr>
              <th scope="row">
                Kernel Version
              </th>
              <td>{{ cluster.version }}</td>
            </tr>
            <tr>
              <th scope="row">
                API Address
              </th>
              <td>{{ cluster.apiUrl }}</td>
            </tr>
            <tr v-if="cluster.nodes">
              <th scope="row">
                Nodes Count
              </th>
              <td>{{ cluster.nodes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClusterSettingsOverview',
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
  methods: {
  }
}
</script>

<style lang="scss">
</style>

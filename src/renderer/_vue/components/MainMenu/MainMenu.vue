<template>
  <div :style="{ paddingTop: computedPaddingTop }" class="main-menu">
    <draggable v-model="clusters">
      <ClusterMenuItem
        v-for="cluster in clusters" :key="cluster.id"
        :cluster="cluster"
      />
    </draggable>
    <AddClusterMenuItem />
    <b-tooltip v-if="clusters.length === 0" show target="add-cluster" placement="rightbottom">
      <p class="text-left">
        This is the quick launch menu.
      </p>
      <p class="text-left">
        Associate clusters and choose the ones you want to access via quick launch menu by clicking the + button.
      </p>
    </b-tooltip>
  </div>
</template>

<script>
import ClusterMenuItem from "@/_vue/components/MainMenu/ClusterMenuItem";
import AddClusterMenuItem from "@/_vue/components/MainMenu/AddClusterMenuItem";
import draggable from 'vuedraggable'
import { clusterStore } from "../../../../common/cluster-store"
import { isMac } from "../../../../common/vars"

const {remote} = require('electron')
const {Menu, MenuItem} = remote

export default {
  name: "MainMenu",
  components: {
    ClusterMenuItem,
    AddClusterMenuItem,
    draggable
  },
  data() {
    return {
      computedPaddingTop: "15px"
    }
  },
  computed: {
    clusters: {
      get: function () {
        return this.$store.getters.clusters;
      },
      set: function (clusters) {
        this.$store.commit("updateClusters", clusters);
        clusterStore.storeClusters(clusters);
      }
    }
  },
  methods: {
    isActive: function (id) {
      return id === this.$route.params.id;
    },
    addCluster: async function () {
      this.$router.push({
        name: "add-cluster-page",
        params: {
          id: "new"
        },
      }).catch(err => {})
    }
  },
  mounted: function () {
    if (isMac) {
      this.computedPaddingTop = "25px";
    }
  }
}
</script>

<style scoped lang="scss">
  .main-menu {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 20px;
    width: 70px;
    padding-top: 15px;
    background: #252729;
    overflow: hidden;
    z-index: 1000;
  }

  .menu-item {
    position: relative;
    cursor: pointer;
    display: block;
    padding: 6px 15px 6px 15px;
    color: #87909c;
    opacity: 0.3;

    &.active {
      opacity: 1;
    }

    &.online {
      opacity: 1;
    }

    &:hover {
      opacity: 1;
    }
  }
</style>

<template>
  <div class="bottom-bar">
    <div id="workspace-area">
      <i class="material-icons">layers</i> {{ currentWorkspace.name }}
    </div>
    <b-popover target="workspace-area" triggers="click" placement="top" :show.sync="show">
      <template v-slot:title>
        <a href="#" @click.prevent="goWorkspaces"><i class="material-icons">layers</i> Workspaces</a>
      </template>

      <ul
        v-for="workspace in workspaces"
        :key="workspace.id"
        :workspace="workspace"
        class="list-group list-group-flush"
      >
        <li class="list-group-item">
          <a href="#" @click.prevent="switchWorkspace(workspace)">{{ workspace.name }}</a>
        </li>
      </ul>
    </b-popover>
  </div>
</template>

<script>
export default {
  name: "BottomBar",
  data() {
    return {
      show: false
    }
  },
  computed: {
    currentWorkspace: function() {
      return this.$store.getters.currentWorkspace;
    },
    workspaces: function() {
      return this.$store.getters.workspaces;
    }
  },
  methods: {
    switchWorkspace: function(workspace) {
      this.show = false;
      this.$store.commit("setCurrentWorkspace", workspace);
      this.$store.dispatch("clearClusters");
      this.$store.dispatch("refreshClusters", workspace);
      this.$router.push({
        name: "landing-page"
      })
    },
    goWorkspaces: function() {
      this.$router.push({
        name: "workspaces-page"
      })
    }
  }
}
</script>

<style scoped lang="scss">
.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--lens-bottom-bar-height);
  background-color: var(--lens-primary);
  z-index: 2000;
}
#workspace-area {
  position: absolute;
  bottom: 2px;
  right: 10px;
  display: block;
  color: #fff;
  opacity: 0.9;
  font-size: 11px;
  cursor: pointer;
  &.active{
    opacity: 1.0;
  }
  i {
    position: relative;
    top: 4px;
    font-size: 14px;
  }
}
</style>

<template>
  <div class="content">
    <ClosePageButton />
    <div class="container-fluid lens-workspaces">
      <div class="header sticky-top">
        <h2><i class="material-icons">layers</i> Workspaces</h2>
      </div>
      <div class="row">
        <div class="col-9 main-content">
          <b-list-group>
            <b-list-group-item @click="editWorkspace(workspace)" href="#" v-for="workspace in workspaces" :key="workspace.id" :workspace="workspace">
              <div class="d-flex w-100 justify-content-between">
                <h5>{{ workspace.name }}</h5>
                <small v-if="workspace.id !== 'default'">
                  <a href="#" title="Switch to workspace" v-b-tooltip.hover.right @click.prevent.stop="switchWorkspace(workspace)"><i class="material-icons">keyboard_arrow_right</i></a>
                </small>
              </div>

              <p class="mb-1">
                {{ workspace.description }}
              </p>
            </b-list-group-item>
          </b-list-group>

          <b-button variant="primary" href="#" @click.prevent="goAdd">
            Add Workspace
          </b-button>
        </div>
        <div class="col-3 help">
          <h3>What is a Workspace?</h3>
          <p>
            Workspaces are used to organize number of clusters into logical groups. A single workspaces contains a list of clusters and their full configuration.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ClosePageButton from "@/_vue/components/common/ClosePageButton";
export default {
  name: 'WorkspacesPage',
  components: {
    ClosePageButton
  },
  data(){
    return {
      fields: [
        {
          key: "name",
          label: "Name"
        },
        {
          key: "description",
          label: "Description"
        }
      ],
      errors: {
      }
    }
  },
  computed: {
    workspaces: function() {
      return this.$store.getters.workspaces;
    }
  },
  methods: {
    switchWorkspace: function(workspace) {
      this.$store.commit("setCurrentWorkspace", workspace);
      this.$store.dispatch("clearClusters");
      this.$store.dispatch("refreshClusters", workspace);
      this.$router.push({
        name: "landing-page"
      });
    },
    editWorkspace: function(workspace) {
      this.$router.push({
        name: "edit-workspace-page",
        params: {
          id: workspace.id
        }
      });
    },
    goAdd: function() {
      this.$router.push({
        name: "add-workspace-page"
      });
    }
  },
  mounted: function() {
    this.$store.commit("hideMenu");
  },
  destroyed: function() {
    this.$store.commit("showMenu");
  }
}
</script>

<style lang="scss" scoped>
#app > .main-view > .content {
  left: 70px;
  right: 70px;
}
h2 {
  i {
    position: relative;
    top: 6px;
  }
}
.main-content {
  padding-left: 40px;
  padding-top: 20px;
}
.lens-workspaces {
  height: 100%;
  overflow-y: scroll;
  & input {
    background-color: #252729 !important;
    border: 0px !important;
    color: #87909c !important;
  }
  .header {
    padding-top: 15px;
  }
  .list-group {
    padding-bottom: 20px;
  }
  .list-group-item {
    background-color: inherit;
    color: var(--lens-text-color-light);
    border: 0;
    border-bottom: 1px solid var(--lens-pane-bg);
    padding-left: 0;
    h5 {
      color: var(--lens-primary)
    }
    h5:hover {
      text-decoration: underline;
    }
    small {
      a {
        color: var(--lens-text-color-light);
        z-index: 100;
      }
      i {
        opacity: 0.3;
        &:hover {
          opacity: 1;
        }
      }
    }
  }
}

</style>

<template>
  <div class="content">
    <ClosePageButton />
    <div class="container-fluid lens-workspaces">
      <div class="header sticky-top">
        <h2><i class="material-icons">layers</i> Workspaces</h2>
      </div>
      <div class="row">
        <div class="col-3" />
        <div class="col-6">
          <h2>Edit Workspace</h2>

          <b-form @submit.prevent="updateWorkspace">
            <b-form-group
              label="Name:"
              label-for="input-name"
            >
              <b-form-input
                id="input-name"
                v-model="workspace.name"
                trim
              />
            </b-form-group>

            <b-form-group
              label="Description:"
              label-for="input-description"
            >
              <b-form-input
                id="input-description"
                v-model="workspace.description"
                trim
              />
            </b-form-group>
            <b-form-row>
              <b-col>
                <b-button variant="primary" type="submit">
                  Save
                </b-button>
                <b-button v-if="workspace.id !== 'default'" v-b-modal.bv-modal-confirm>
                  Delete
                </b-button>
                <b-modal id="bv-modal-confirm" @ok="deleteWorkspace" ok-title="Delete" ok-variant="danger" title-class="confirm-header" hide-backdrop title="Confirm workspace delete">
                  <p>Are you sure you want to delete <strong>{{ workspace.name }}</strong> workspace from Lens?</p>
                </b-modal>
              </b-col>
            </b-form-row>
          </b-form>
        </div>
        <div class="col-3" />
      </div>
    </div>
  </div>
</template>

<script>
import ClosePageButton from "@/components/common/ClosePageButton";

export default {
  name: 'EditWorkspacePage',
  components: {
    ClosePageButton
  },
  data() {
    return {
      errors: {
        name: null,
        description: null
      }
    }
  },
  computed: {
    workspace: function() {
      return this.$store.getters.workspaceById(this.$route.params.id)
    }
  },
  methods: {
    updateWorkspace: function() {
      this.$store.commit("updateWorkspace", this.workspace)
      this.$router.push({
        name: "workspaces-page"
      })
    },
    deleteWorkspace: async function() {
      await this.$store.commit("removeWorkspace", this.workspace)
      this.$router.push({
        name: "workspaces-page"
      })
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
}

</style>

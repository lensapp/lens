import { MutationTree, ActionTree, GetterTree } from "vuex"
import { workspaceStore, Workspace, WorkspaceData } from "../../../../common/workspace-store"

export interface WorkspaceState {
  workspaces: Array<Workspace>;
  currentWorkspace: Workspace;
}

const state: WorkspaceState = {
  workspaces: workspaceStore.getAllWorkspaces(),
  currentWorkspace: workspaceStore.getAllWorkspaces().find((w) => w.id === "default")
}

const actions: ActionTree<WorkspaceState, any>  = {
}

const getters: GetterTree<WorkspaceState, any> = {
  workspaces: state => state.workspaces,
  currentWorkspace: state => state.currentWorkspace,
  workspaceById: state => (id: string) => {
    return state.workspaces.find((ws) => ws.id == id)
  }
}

const mutations: MutationTree<WorkspaceState> = {
  setCurrentWorkspace(state, workspace: Workspace) {
    state.currentWorkspace = workspace
  },
  addWorkspace(state, workspace: WorkspaceData) {
    workspaceStore.storeWorkspace(workspace)
    state.workspaces = workspaceStore.getAllWorkspaces()
  },
  updateWorkspace(state, workspace: WorkspaceData) {
    workspaceStore.storeWorkspace(workspace)
    state.workspaces = workspaceStore.getAllWorkspaces()
  },
  removeWorkspace(state, workspace: Workspace) {
    workspaceStore.removeWorkspace(workspace)
    state.workspaces = workspaceStore.getAllWorkspaces()
  }
}

export default {
  namespaced: false,
  state,
  getters,
  mutations,
  actions
}

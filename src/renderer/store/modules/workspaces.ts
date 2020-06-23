import { MutationTree, ActionTree, GetterTree } from "vuex"
import { WorkspaceStore, Workspace, WorkspaceData } from "../../../common/workspace-store"

export interface WorkspaceState {
  workspaces: Array<Workspace>;
  currentWorkspace: Workspace;
}

const state: WorkspaceState = {
  workspaces: WorkspaceStore.getInstance().getAllWorkspaces(),
  currentWorkspace: WorkspaceStore.getInstance().getAllWorkspaces().find((w) => w.id === "default"),
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
    WorkspaceStore.getInstance().storeWorkspace(workspace)
    state.workspaces = WorkspaceStore.getInstance().getAllWorkspaces()
  },
  updateWorkspace(state, workspace: WorkspaceData) {
    WorkspaceStore.getInstance().storeWorkspace(workspace)
    state.workspaces = WorkspaceStore.getInstance().getAllWorkspaces()
  },
  removeWorkspace(state, workspace: Workspace) {
    WorkspaceStore.getInstance().removeWorkspace(workspace)
    state.workspaces = WorkspaceStore.getInstance().getAllWorkspaces()
  }
}

export default {
  namespaced: false,
  state,
  getters,
  mutations,
  actions
}

import { ActionTree, GetterTree, MutationTree } from "vuex"
import { Workspace, workspaceStore } from "../../../../common/workspace-store"

export interface WorkspaceState {
  workspaces: Array<Workspace>;
  currentWorkspace: Workspace;
}

const state: WorkspaceState = {
  workspaces: workspaceStore.workspaces,
  currentWorkspace: workspaceStore.workspaces.find((w) => w.id === "default")
}

const actions: ActionTree<WorkspaceState, any> = {}

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
  addWorkspace(state, workspace: Workspace) {
    workspaceStore.saveWorkspace({ ...workspace })
    state.workspaces = workspaceStore.workspaces
  },
  updateWorkspace(state, workspace: Workspace) {
    workspaceStore.saveWorkspace({ ...workspace })
    state.workspaces = workspaceStore.workspaces
  },
  removeWorkspace(state, workspace: Workspace) {
    workspaceStore.removeWorkspace(workspace.id)
    state.workspaces = workspaceStore.workspaces
  }
}

export default {
  namespaced: false,
  state,
  getters,
  mutations,
  actions
}

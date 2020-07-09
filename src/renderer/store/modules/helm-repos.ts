import Vue from "vue";
import { MutationTree, ActionTree, GetterTree } from "vuex";
import { HelmRepo, repoManager } from "../../../main/helm-repo-manager";

export interface HelmRepoState {
  repos: HelmRepo[];
}

const state: HelmRepoState = {
  repos: []
};

const actions: ActionTree<HelmRepoState, any>  = {
  async addHelmRepo({ commit: _commit }, data) {
    const res = await repoManager.addRepo(data).catch(() => false);
    if(!res) {
      return false;
    }
    return await this.dispatch("refreshHelmRepos");
  },
  async removeHelmRepo({ commit: _commit }, data) {
    const res = await repoManager.removeRepo(data).catch(() => false);
    if(!res) {
      return false;
    }
    return await this.dispatch("refreshHelmRepos");
  },
  async refreshHelmRepos({ commit }) {
    const repos: HelmRepo[] = await repoManager.repositories().catch(() => null);
    if(!repos) {
      return false;
    }
    commit('updateRepos', repos);
    return true;
  }
};

const getters: GetterTree<HelmRepoState, any> = {
  repos: state => state.repos
};

const mutations: MutationTree<HelmRepoState> = {
  updateRepos(state, repos: HelmRepo[]) {
    Vue.set(state, 'repos', [...repos]);
  },
};

export default {
  namespaced: false,
  state,
  getters,
  mutations,
  actions
};

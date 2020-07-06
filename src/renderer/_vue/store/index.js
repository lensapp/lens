import Vue from 'vue'
import Vuex from 'vuex'
import { userStore } from "../../../common/user-store"
import { getAppVersion } from "../../../common/utils/app-version"
import KubeContexts from './modules/kube-contexts'
import Clusters from './modules/clusters'
import HelmRepos from './modules/helm-repos'
import Workspaces from './modules/workspaces'
import { tracker } from "../../../common/tracker"
import { PromiseIpc } from 'electron-promise-ipc'

Vue.use(Vuex);

const promiseIpc = new PromiseIpc({maxTimeoutMs: 120000});

export default new Vuex.Store({
  modules: {
    Clusters,
    HelmRepos,
    KubeContexts,
    Workspaces
  },
  state: {
    preferences: {},
    hud: {
      isMenuVisible: true,
    },
    seenContexts: userStore.seenContexts,
    lastSeenAppVersion: userStore.lastSeenAppVersion,
  },
  mutations: {
    storeSeenContexts(state, contexts) {
      contexts.forEach(ctx => userStore.seenContexts.add(ctx));
      state.seenContexts = contexts;
    },
    updateLastSeenAppVersion(state, appVersion) {
      state.lastSeenAppVersion = appVersion;
      userStore.lastSeenAppVersion = appVersion
    },
    loadPreferences(state) {
      this.commit("savePreferences", userStore.preferences);
    },
    savePreferences(state, prefs) {
      state.preferences = prefs;
      userStore.preferences = prefs;
      this.dispatch("destroyWebviews")
      promiseIpc.send("preferencesSaved")
    },
    hideMenu(state) {
      state.hud.isMenuVisible = false;
    },
    showMenu(state) {
      state.hud.isMenuVisible = true;
    }
  },
  actions: {
    async init({commit, getters}) {
      commit("loadPreferences");
      await this.dispatch('refreshClusters', getters.currentWorkspace);
      return true;
    },
    async addSeenContexts({commit}, data) {
      commit('storeSeenContexts', data);
    },
    async updateLastSeenAppVersion({commit, state}) {
      tracker.event("app", "whats-new-seen")
      commit("updateLastSeenAppVersion", getAppVersion())
    }
  },
  getters: {
    seenContexts: state => state.seenContexts,
    hud: state => state.hud,
    isMenuVisible: function (state, getters) {
      if (userStore.hasNewAppVersion) return false;
      return state.hud.isMenuVisible;
    },
    showWhatsNew: function (state) {
      return userStore.hasNewAppVersion;
    },
    preferences: state => state.preferences,
  }
});

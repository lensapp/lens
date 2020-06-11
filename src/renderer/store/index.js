import Vue from 'vue'
import Vuex from 'vuex'
import { userStore } from "../../common/user-store"
import KubeContexts from './modules/kube-contexts'
import Clusters from './modules/clusters'
import HelmRepos from './modules/helm-repos'
import Workspaces from './modules/workspaces'
import * as semver from "semver"
import * as appUtil from "../../common/app-utils"

// promise ipc
import { PromiseIpc } from 'electron-promise-ipc'
const promiseIpc = new PromiseIpc( { maxTimeoutMs: 120000 } );

// tracker
import { Tracker } from "../../common/tracker"
import { remote } from "electron"
const tracker = new Tracker(remote.app);

Vue.use(Vuex);

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
    seenContexts: userStore.getSeenContexts(),
    lastSeenAppVersion: userStore.lastSeenAppVersion(),
  },
  mutations: {
    storeSeenContexts(state, context) {
      const seenContexts =  userStore.storeSeenContext(context);
      state.seenContexts = seenContexts
    },
    updateLastSeenAppVersion(state, appVersion) {
      state.lastSeenAppVersion = appVersion;
      userStore.setLastSeenAppVersion(appVersion)
    },
    loadPreferences(state) {
      this.commit("savePreferences", userStore.getPreferences());
    },
    savePreferences(state, prefs) {
      if (prefs.allowTelemetry) {
        tracker.event("telemetry", "enabled")
      } else {
        tracker.event("telemetry", "disabled")
      }
      state.preferences = prefs;
      userStore.setPreferences(prefs);
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
    async addSeenContexts({commit}, data){
      commit('storeSeenContexts', data);
    },
    async updateLastSeenAppVersion({commit, state}) {
      tracker.event("app", "whats-new-seen")
      commit("updateLastSeenAppVersion", appUtil.getAppVersion())
    }
  },
  getters : {
    seenContexts: state => state.seenContexts,
    hud: state => state.hud,
    isMenuVisible: function(state, getters){
      return state.hud.isMenuVisible && !getters.showWhatsNew;
    },
    showWhatsNew: function(state) {
      return semver.gt(appUtil.getAppVersion(), state.lastSeenAppVersion);
    },
    preferences: state => state.preferences,
  }
});

import Vue from 'vue'
import Vuex from 'vuex'
import semver from "semver"
import { getAppVersion } from "../../../common/utils/app-version"
import { UserStore } from "../../common/user-store"
import KubeContexts from './modules/kube-contexts'
import Clusters from './modules/clusters'
import HelmRepos from './modules/helm-repos'
import Workspaces from './modules/workspaces'

// promise ipc
import { PromiseIpc } from 'electron-promise-ipc'
const promiseIpc = new PromiseIpc( { maxTimeoutMs: 120000 } );

// tracker
import { Tracker } from "../../../common/tracker"
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
    seenContexts: UserStore.getInstance().getSeenContexts(),
    lastSeenAppVersion: UserStore.getInstance().lastSeenAppVersion(),
  },
  mutations: {
    storeSeenContexts(state, context) {
      state.seenContexts = UserStore.getInstance().storeSeenContext(context)
    },
    updateLastSeenAppVersion(state, appVersion) {
      state.lastSeenAppVersion = appVersion;
      UserStore.getInstance().setLastSeenAppVersion(appVersion)
    },
    loadPreferences(state) {
      this.commit("savePreferences", UserStore.getInstance().getPreferences());
    },
    savePreferences(state, prefs) {
      tracker.event("telemetry", prefs.allowTelemetry ? "enabled" : "disabled")
      state.preferences = prefs;
      UserStore.getInstance().setPreferences(prefs);
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
      commit("updateLastSeenAppVersion", getAppVersion())
    }
  },
  getters : {
    seenContexts: state => state.seenContexts,
    hud: state => state.hud,
    isMenuVisible: function(state, getters){
      return state.hud.isMenuVisible && !getters.showWhatsNew;
    },
    showWhatsNew: function(state) {
      return semver.gt(getAppVersion(), state.lastSeenAppVersion);
    },
    preferences: state => state.preferences,
  }
});

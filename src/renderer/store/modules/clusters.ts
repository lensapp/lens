import Vue from "vue"
import { ClusterInfo } from "../../../main/cluster"
import { MutationTree, ActionTree, GetterTree } from "vuex"
import { PromiseIpc } from 'electron-promise-ipc'
import { Tracker } from "../../../common/tracker"
import { remote } from "electron"
import { clusterStore } from "../../../common/cluster-store"
import { Workspace } from "../../../common/workspace-store"

const promiseIpc = new PromiseIpc( { maxTimeoutMs: 120000 } );
const tracker = new Tracker(remote.app);

export interface LensWebview {
  id: string;
  loaded: boolean;
  webview?: any;
}

export interface ClusterState {
  lenses: LensWebview[];
  clusters: ClusterInfo[];
}

const state: ClusterState = {
  lenses: [],
  clusters: []
}

const actions: ActionTree<ClusterState, any>  = {
  async refreshClusters({commit}, currentWorkspace: Workspace) {
    const clusters: ClusterInfo[] = await promiseIpc.send('getClusters', currentWorkspace.id).catch((error: Error) => {
      return false;
    })
    if(!clusters) return false;
    commit('updateClusters', clusters);
    clusters.forEach((cluster: ClusterInfo) => {
      const lens: LensWebview = {
        id: cluster.id,
        webview: null,
        loaded: false
      };
      commit("updateLens", lens)
    })
    return true;
  },
  async getCluster({commit, getters}, id: string) {
    const cluster: ClusterInfo = getters.clusters.find((c: ClusterInfo) => c.id === id)
    if(!cluster) return null;

    const remoteCluster = await promiseIpc.send("getCluster", cluster.id)
    if(!remoteCluster) return null;

    Object.assign(cluster, remoteCluster)
    commit('updateCluster', cluster);

    return cluster;
  },
  async refineCluster({commit}, id: string) {
    console.log("VUEX: ACTION: REFINE CLUSTER", id);

    const remoteCluster = await promiseIpc.send("getCluster", id)
    if(!remoteCluster) return null;

    commit('updateCluster', remoteCluster);

    return remoteCluster;
  },
  async stopCluster({dispatch, getters}, id: string) {
    const cluster: ClusterInfo = getters.clusters.find((c: ClusterInfo) => c.id === id)
    if (!cluster) return;

    const lens = getters.lensById(cluster.id)
    if (lens) {
      await dispatch("detachWebview", lens)
      await promiseIpc.send("stopCluster", cluster.id)
      tracker.event("cluster", "stop")
    }
  },
  async removeCluster({getters, dispatch}, id: string) {
    const cluster: ClusterInfo = getters.clusters.find((c: ClusterInfo) => c.id === id)
    if (!cluster) {
      return
    }
    const lens = this.getters.lensById(cluster.id)
    if (lens) {
      dispatch("detachWebview", lens)
    }
    await promiseIpc.send("removeCluster", cluster.id).catch((error: Error) => {
      return false;
    })
    tracker.event("cluster", "remove´");
    await dispatch("refreshClusters", getters.currentWorkspace)
    return true;
  },
  async addCluster({commit, getters, dispatch}, data) {
    const res = await promiseIpc.send("addCluster", data)
    if(!res) return null;

    tracker.event("cluster", "add");
    commit('updateClusters', res.allClusters);
    await dispatch("refreshClusters", getters.currentWorkspace);
    return res.addedCluster;
  },
  async clearClusters({commit, getters, dispatch}){
    // todo: clean from main process as well?
    getters.lenses.forEach((lens: LensWebview) => {
      if (lens.webview) {
        dispatch("detachWebview", lens)
      }
    })
    commit('updateLenses', []);
    commit('updateClusters', []);
    return true;
  },

  async uploadClusterIcon({commit}, data) {
    const res = await promiseIpc.send("saveClusterIcon", data)
    tracker.event("cluster", "upload-icon")
    if (res.cluster) commit("updateCluster", res.cluster)
    return res
  },

  async resetClusterIcon({commit}, data) {
    const res = await promiseIpc.send("resetClusterIcon", data.clusterId)
    tracker.event("cluster", "reset-icon")
    if (res.cluster) commit("updateCluster", res.cluster)
    return res
  },

  // For data structure see: cluster-manager.ts / FeatureInstallRequest
  async installClusterFeature({commit}, data) {
    // Custom no timeout IPC as install can take very variable time
    const ipc = new PromiseIpc();
    const response = await ipc.send('installFeature', data)
    console.log("installer result:", response);
    const cluster = await ipc.send('refreshCluster', data.clusterId)

    tracker.event("cluster", "install-feature")
    commit("updateCluster", cluster)
    return response
  },
  // For data structure see: cluster-manager.ts / FeatureInstallRequest
  async upgradeClusterFeature({commit}, data) {
    // Custom no timeout IPC as install can take very variable time
    const ipc = new PromiseIpc();
    const response = await ipc.send('upgradeFeature', data)
    console.log("upgrade result:", response);
    const cluster = await ipc.send('refreshCluster', data.clusterId)


    tracker.event("cluster", "upgrade-feature")
    commit("updateCluster", cluster)
    return response
  },
  // For data structure see: cluster-manager.ts / FeatureInstallRequest
  async uninstallClusterFeature({commit}, data) {
    // Custom no timeout IPC as uninstall can take very variable time
    const ipc = new PromiseIpc();
    const response = await ipc.send('uninstallFeature', data)
    console.log("uninstaller result:", response);
    const cluster = await ipc.send('refreshCluster', data.clusterId)

    tracker.event("cluster", "uninstall-feature")
    commit("updateCluster", cluster)
    return response
  },

  attachWebview({commit}, lens: LensWebview) {
    const container: any = document.getElementById("lens-container");
    if (!container || !lens.webview) {
      return
    }
    container.style = "display: block;"
    let webview = null
    container.childNodes.forEach((child: any) => {
      if (child === lens.webview) {
        webview = child
      }
    })
    if (!webview) {
      container.appendChild(lens.webview)
    }
    container.childNodes.forEach((child: any) => {
      if (child !== lens.webview) {
        child.style = "display: none;"
      } else {
        child.style = "top: 0; bottom: 20px; position: absolute; width: 100%;"
      }
    })
    promiseIpc.send("enableClusterSettingsMenuItem", lens.id)
  },
  detachWebview({commit}, lens: LensWebview) {
    const container: any = document.getElementById("lens-container");
    if (!container) { return }
    container.childNodes.forEach((child: any) => {
      if (child === lens.webview) {
        container.removeChild(lens.webview)
        lens.webview = null
        lens.loaded = false
        commit("updateLens", lens)
      }
    })
    promiseIpc.send("disableClusterSettingsMenuItem")
  },
  hideWebviews({commit}) {
    const container: any = document.getElementById("lens-container");
    if (!container) { return }
    container.style = "display: none;"
    container.childNodes.forEach((child: any) => {
      child.style = "display: none;"
    })
    promiseIpc.send("disableClusterSettingsMenuItem")
  },
  destroyWebviews({commit}) {
    state.lenses.forEach((lens) => {
      this.dispatch("detachWebview", lens)
    })
  },
  storeCluster({commit}, cluster: ClusterInfo) {
    clusterStore.storeCluster(cluster);
    commit("updateCluster", cluster)
    promiseIpc.send("clusterStored", cluster.id)
  }
}

const getters: GetterTree<ClusterState, any> = {
  clusters: state => state.clusters,
  clusterById: state => (id: string) => {
    const cluster = state.clusters.find(c => c.id === id);
    if (cluster) {
      return cluster;
    } else {
      return null;
    }
  },
  lenses: state => state.lenses,
  lensById: state => (id: string) => {
    const lens = state.lenses.find(c => c.id === id);
    if (lens) {
      return lens;
    } else {
      return null;
    }
  },
}

const mutations: MutationTree<ClusterState> = {
  updateClusters(state, clusters: ClusterInfo[]) {
    Vue.set(state, 'clusters', [...clusters])
  },
  updateCluster(state, cluster) {
    state.clusters.forEach((c, index) => {
      if(c.id === cluster.id) {
        Vue.set(state.clusters, index, cluster)
      }
    })
  },
  updateLenses(state, data) {
    Vue.set(state, 'lenses', [...data])
  },
  updateLens(state, lens: LensWebview) {
    const lensIndex = state.lenses.findIndex(l => l.id == lens.id);
    if (lensIndex >= 0) {
      state.lenses[lensIndex] = lens
      Vue.set(state.lenses, lensIndex, lens)
    } else {
      console.log("update new lens")
      state.lenses.push(lens)
    }
  }
}

export default {
  namespaced: false,
  state,
  getters,
  mutations,
  actions
}

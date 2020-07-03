import * as k8s from "@kubernetes/client-node"
import { splitConfig, dumpConfigYaml } from "../../../../main/k8s"

const state = {
  availableKubeContexts: []
}

const actions = {
  reloadAvailableKubeContexts({commit}, file) {
    let kc = new k8s.KubeConfig();
    try {
      kc.loadFromFile(file);
    } catch (error) {
      console.error("Failed to read default kubeconfig: " + error.message);
    }

    // Remove the default setup the client makes if it does not find anything in the default config
    // See: https://github.com/kubernetes-client/javascript/blob/2fc8fbc956ca89bf425ca3ea045d46ee7b75296b/src/config.ts#L253
    // It defaults to loadFromClusterAndUser() when no config file can be found
    if(kc.currentContext === "loaded-context") {
      kc = new k8s.KubeConfig();
    }

    commit("saveAvailableKubeContexts", splitConfig(kc))
  }
}

const getters = {
  availableKubeContexts: function(state){
    return state.availableKubeContexts
  }
}

const mutations = {
  saveAvailableKubeContexts(state, contexts) {
    state.availableKubeContexts = contexts
  }
}

export default {
  namespaced: false,
  state,
  getters,
  mutations,
  actions
}

import { createIpcChannel } from "./ipc";
import { ClusterId, clusterStore } from "./cluster-store";
import { tracker } from "./tracker";

export const clusterIpc = {
  activate: createIpcChannel({
    channel: "cluster:activate",
    handle: async (clusterId: ClusterId = clusterStore.activeClusterId) => {
      return clusterStore.getById(clusterId)?.activate();
    },
  }),

  disconnect: createIpcChannel({
    channel: "cluster:disconnect",
    handle: (clusterId: ClusterId = clusterStore.activeClusterId) => {
      tracker.event("cluster", "stop");
      return clusterStore.getById(clusterId)?.disconnect();
    },
  }),

  reconnect: createIpcChannel({
    channel: "cluster:reconnect",
    handle: (clusterId: ClusterId = clusterStore.activeClusterId) => {
      tracker.event("cluster", "reconnect");
      return clusterStore.getById(clusterId)?.reconnect();
    },
  }),
}
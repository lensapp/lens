import { createIpcChannel } from "./ipc";
import { ClusterId, clusterStore } from "./cluster-store";
import { tracker } from "./tracker";

export const clusterIpc = {
  refresh: createIpcChannel({
    channel: "cluster:refresh",
    handle: async (clusterId: ClusterId = clusterStore.activeClusterId) => {
      const cluster = clusterStore.getById(clusterId);
      if (cluster) {
        await cluster.refreshStatus();
        cluster.pushState();
      }
    },
  }),

  disconnect: createIpcChannel({
    channel: "cluster:disconnect",
    handle: (clusterId: ClusterId) => {
      tracker.event("cluster", "stop");
      clusterStore.getById(clusterId)?.disconnect();
    },
  }),

  reconnect: createIpcChannel({
    channel: "cluster:reconnect",
    handle: (clusterId: ClusterId) => {
      tracker.event("cluster", "reconnect");
      clusterStore.getById(clusterId)?.reconnect();
    },
  }),
}
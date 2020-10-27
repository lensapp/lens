import { createIpcChannel } from "./ipc";
import { ClusterId, clusterStore } from "./cluster-store";
import { extensionLoader } from "../extensions/extension-loader"
import { appEventBus } from "./event-bus"
import { ResourceApplier } from "../main/resource-applier";

export const clusterIpc = {
  activate: createIpcChannel({
    channel: "cluster:activate",
    handle: (clusterId: ClusterId, force = false) => {
      const cluster = clusterStore.getById(clusterId);
      if (cluster) {
        return cluster.activate(force);
      }
    },
  }),

  setFrameId: createIpcChannel({
    channel: "cluster:set-frame-id",
    handle: (clusterId: ClusterId, frameId?: number) => {
      const cluster = clusterStore.getById(clusterId);
      if (cluster) {
        if (frameId) cluster.frameId = frameId; // save cluster's webFrame.routingId to be able to send push-updates
        extensionLoader.broadcastExtensions(frameId)
        return cluster.pushState();
      }
    },
  }),

  refresh: createIpcChannel({
    channel: "cluster:refresh",
    handle: (clusterId: ClusterId) => {
      const cluster = clusterStore.getById(clusterId);
      if (cluster) return cluster.refresh({ refreshMetadata: true })
    },
  }),

  disconnect: createIpcChannel({
    channel: "cluster:disconnect",
    handle: (clusterId: ClusterId) => {
      appEventBus.emit({name: "cluster", action: "stop"});
      return clusterStore.getById(clusterId)?.disconnect();
    },
  }),

  kubectlApplyAll: createIpcChannel({
    channel: "cluster:kubectl-apply-all",
    handle: (clusterId: ClusterId, resources: string[]) => {
      appEventBus.emit({name: "cluster", action: "kubectl-apply-all"})
      const cluster = clusterStore.getById(clusterId);
      if (cluster) {
        const applier = new ResourceApplier(cluster)
        applier.kubectlApplyAll(resources)
      } else {
        throw `${clusterId} is not a valid cluster id`;
      }
    }
  }),
}

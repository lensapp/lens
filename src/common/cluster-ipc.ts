import { createIpcChannel } from "./ipc";
import { ClusterId, clusterStore } from "./cluster-store";
import { extensionLoader } from "../extensions/extension-loader"
import { appEventBus } from "./event-bus"

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
      if (cluster) return cluster.refresh();
    },
  }),

  disconnect: createIpcChannel({
    channel: "cluster:disconnect",
    handle: (clusterId: ClusterId) => {
      appEventBus.emit({name: "cluster", action: "stop"});
      return clusterStore.getById(clusterId)?.disconnect();
    },
  }),

  installFeature: createIpcChannel({
    channel: "cluster:install-feature",
    handle: async (clusterId: ClusterId, feature: string, config?: any) => {
      appEventBus.emit({name: "cluster", action: "install", params: { feature: feature}})
      const cluster = clusterStore.getById(clusterId);
      if (cluster) {
        await cluster.installFeature(feature, config)
      } else {
        throw `${clusterId} is not a valid cluster id`;
      }
    }
  }),

  uninstallFeature: createIpcChannel({
    channel: "cluster:uninstall-feature",
    handle: (clusterId: ClusterId, feature: string) => {
      appEventBus.emit({name: "cluster", action: "uninstall", params: { feature: feature}})
      return clusterStore.getById(clusterId)?.uninstallFeature(feature)
    }
  }),

  upgradeFeature: createIpcChannel({
    channel: "cluster:upgrade-feature",
    handle: (clusterId: ClusterId, feature: string, config?: any) => {
      appEventBus.emit({name: "cluster", action: "upgrade", params: { feature: feature}})
      return clusterStore.getById(clusterId)?.upgradeFeature(feature, config)
    }
  }),
}

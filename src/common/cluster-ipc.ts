import { handleRequest } from "./ipc";
import { ClusterId, clusterStore } from "./cluster-store";
import { appEventBus } from "./event-bus"
import { ResourceApplier } from "../main/resource-applier";
import { ipcMain } from "electron";

if (ipcMain) {
  handleRequest("cluster:activate", (event, clusterId: ClusterId, force = false) => {
    const cluster = clusterStore.getById(clusterId);
    if (cluster) {
      return cluster.activate(force);
    }
  })

  handleRequest("cluster:set-frame-id", (event, clusterId: ClusterId, frameId?: number) => {
    const cluster = clusterStore.getById(clusterId);
    if (cluster) {
      if (frameId) cluster.frameId = frameId; // save cluster's webFrame.routingId to be able to send push-updates
      return cluster.pushState();
    }
  })

  handleRequest("cluster:refresh", (event, clusterId: ClusterId) => {
    const cluster = clusterStore.getById(clusterId);
    if (cluster) return cluster.refresh({ refreshMetadata: true })
  })

  handleRequest("cluster:disconnect", (event, clusterId: ClusterId) => {
    appEventBus.emit({name: "cluster", action: "stop"});
    return clusterStore.getById(clusterId)?.disconnect();
  })

  handleRequest("cluster:kubectl-apply-all", (event, clusterId: ClusterId, resources: string[]) => {
    appEventBus.emit({name: "cluster", action: "kubectl-apply-all"})
    const cluster = clusterStore.getById(clusterId);
    if (cluster) {
      const applier = new ResourceApplier(cluster)
      applier.kubectlApplyAll(resources)
    } else {
      throw `${clusterId} is not a valid cluster id`;
    }
  })
}

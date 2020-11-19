import { handleRequest } from "./ipc";
import { ClusterId, clusterStore } from "./cluster-store";
import { appEventBus } from "./event-bus"
import { ResourceApplier } from "../main/resource-applier";
import { ipcMain } from "electron";
import { ClusterManager } from "../main/cluster-manager";
import { clusterFrameMap } from "./cluster-frames"

export const clusterActivateHandler = "cluster:activate"
export const clusterSetFrameIdHandler = "cluster:set-frame-id"
export const clusterRefreshHandler = "cluster:refresh"
export const clusterDisconnectHandler = "cluster:disconnect"
export const clusterKubectlApplyAllHandler = "cluster:kubectl-apply-all"

function getById(clusterId: ClusterId) {
  return ClusterManager.getInstance<ClusterManager>().getClusterById(clusterId)
}

if (ipcMain) {
  handleRequest(clusterActivateHandler, (event, clusterId: ClusterId, force = false) => {
    return getById(clusterId)?.activate(force);
  })

  handleRequest(clusterSetFrameIdHandler, (event, clusterId: ClusterId, frameId?: number) => {
    const managedCluster = getById(clusterId);
    if (managedCluster) {
      clusterFrameMap.set(managedCluster.cluster.id, frameId)
      return managedCluster.cluster.pushState();
    }
  })

  handleRequest(clusterRefreshHandler, (event, clusterId: ClusterId) => {
    getById(clusterId)?.refresh({ refreshMetadata: true });
  })

  handleRequest(clusterDisconnectHandler, (event, clusterId: ClusterId) => {
    appEventBus.emit({name: "cluster", action: "stop"});
    const managedCluster = getById(clusterId);
    if (managedCluster) {
      managedCluster.disconnect();
      clusterFrameMap.delete(managedCluster.id)
    }
  })

  handleRequest(clusterKubectlApplyAllHandler, (event, clusterId: ClusterId, resources: string[]) => {
    appEventBus.emit({name: "cluster", action: "kubectl-apply-all"})
    const cluster = getById(clusterId);
    if (cluster) {
      const applier = new ResourceApplier(cluster)
      applier.kubectlApplyAll(resources)
    } else {
      throw `${clusterId} is not a valid cluster id`;
    }
  })
}

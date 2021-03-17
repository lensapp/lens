import { clusterStore as internalClusterStore, ClusterId } from "../../common/cluster-store";
import { workspaceStore as internalWorkspaceStore } from "../../common/workspace-store";
import type { ClusterModel } from "../../common/cluster-store";
import { Cluster } from "../../main/cluster";
import { Singleton } from "../core-api/utils";
import { ObservableMap } from "mobx";

export { Cluster } from "../../main/cluster";
export type { ClusterModel, ClusterId } from "../../common/cluster-store";

/**
 * Store for all added clusters
 *
 * @beta
 */
export class ClusterStore extends Singleton {

  /**
   * Active cluster id
   *
   * @deprecated use `workspaceStore.currentWorkspace.activeClusterId`
   */
  get activeClusterId(): string {
    console.warn("get Store.ClusterStore.activeClusterId is deprecated. Use workspace.currentWorkspace.activeClusterId");

    return internalWorkspaceStore.currentWorkspace.activeClusterId;
  }

  /**
   * Set active cluster id
   * @deprecated use `LensExtension.navigate()`
   */
  set activeClusterId(id : ClusterId) {
    console.warn("Store.ClusterStore.activeClusterId is deprecated. Use LensExtension.navigate()");
    internalWorkspaceStore.currentWorkspace.setActiveCluster(id);
  }

  /**
   * Map of all clusters
   */
  get clusters(): ObservableMap<string, Cluster> {
    return internalClusterStore.clusters;
  }

  /**
   * Get active cluster (a cluster which is currently visible)
   *
   * @deprecated use `clusterStore.getById(workspaceStore.currentWorkspace.activeClusterId)`
   */
  get activeCluster(): Cluster {
    return clusterStore.getById(internalWorkspaceStore.currentWorkspace.activeClusterId);
  }

  /**
   * Array of all clusters
   */
  get clustersList(): Cluster[] {
    return internalClusterStore.clustersList;
  }

  /**
   * Array of all enabled clusters
   */
  get enabledClustersList(): Cluster[] {
    return internalClusterStore.enabledClustersList;
  }

  /**
   * Array of all clusters that have active connection to a Kubernetes cluster
   */
  get connectedClustersList(): Cluster[] {
    return internalClusterStore.connectedClustersList;
  }

  /**
   * Get cluster object by cluster id
   * @param id cluster id
   */
  getById(id: ClusterId): Cluster {
    return internalClusterStore.getById(id);
  }

  /**
   * Get all clusters belonging to a workspace
   * @param workspaceId workspace id
   */
  getByWorkspaceId(workspaceId: string): Cluster[] {
    return internalClusterStore.getByWorkspaceId(workspaceId);
  }

  /**
   * Add clusters to store
   * @param models list of cluster models
   */
  addClusters(...models: ClusterModel[]): Cluster[] {
    return internalClusterStore.addClusters(...models);
  }

  /**
   * Add a cluster to store
   * @param model cluster
   */
  addCluster(model: ClusterModel | Cluster): Cluster {
    return internalClusterStore.addCluster(model);
  }

  /**
   * Remove a cluster from store
   * @param model cluster
   */
  async removeCluster(model: ClusterModel) {
    return internalClusterStore.removeById(model.id);
  }

  /**
   * Remove a cluster from store by id
   * @param clusterId cluster id
   */
  async removeById(clusterId: ClusterId) {
    return internalClusterStore.removeById(clusterId);
  }

  /**
   * Remove all clusters belonging to a workspaces
   * @param workspaceId workspace id
   */
  removeByWorkspaceId(workspaceId: string) {
    return internalClusterStore.removeByWorkspaceId(workspaceId);
  }
}


export const clusterStore = ClusterStore.getInstance<ClusterStore>();

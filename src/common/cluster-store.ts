import path from "path";
import { app, ipcRenderer, remote, webFrame, webContents } from "electron";
import { unlink } from "fs-extra";
import { action, computed, observable, toJS } from "mobx";
import { BaseStore } from "./base-store";
import { Cluster, ClusterState } from "../main/cluster";
import migrations from "../migrations/cluster-store"
import logger from "../main/logger";
import { tracker } from "./tracker";
import { dumpConfigYaml } from "./kube-helpers";
import { saveToAppFiles } from "./utils/saveToAppFiles";
import { KubeConfig } from "@kubernetes/client-node";
import _ from "lodash";
import move from "array-move";
import type { WorkspaceId } from "./workspace-store";

export interface ClusterIconUpload {
  clusterId: string;
  name: string;
  path: string;
}

export interface ClusterStoreModel {
  activeCluster?: ClusterId; // last opened cluster
  clusters?: ClusterModel[]
}

export type ClusterId = string;

export interface ClusterModel {
  id: ClusterId;
  workspace?: WorkspaceId;
  contextName?: string;
  preferences?: ClusterPreferences;
  kubeConfigPath: string;

  /** @deprecated */
  kubeConfig?: string; // yaml
}

export interface ClusterPreferences {
  terminalCWD?: string;
  clusterName?: string;
  prometheus?: {
    namespace: string;
    service: string;
    port: number;
    prefix: string;
  };
  prometheusProvider?: {
    type: string;
  };
  iconOrder?: number;
  icon?: string;
  httpsProxy?: string;
}

export class ClusterStore extends BaseStore<ClusterStoreModel> {
  static getCustomKubeConfigPath(clusterId: ClusterId): string {
    return path.resolve((app || remote.app).getPath("userData"), "kubeconfigs", clusterId);
  }

  static embedCustomKubeConfig(clusterId: ClusterId, kubeConfig: KubeConfig | string): string {
    const filePath = ClusterStore.getCustomKubeConfigPath(clusterId);
    const fileContents = typeof kubeConfig == "string" ? kubeConfig : dumpConfigYaml(kubeConfig);
    saveToAppFiles(filePath, fileContents, { mode: 0o600 });
    return filePath;
  }

  private constructor() {
    super({
      configName: "lens-cluster-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      migrations: migrations,
    });
  }

  @observable activeClusterId: ClusterId;
  @observable removedClusters = observable.map<ClusterId, Cluster>();
  @observable clusters = observable.map<ClusterId, Cluster>();

  registerIpcListener() {
    logger.info(`[CLUSTER-STORE] start to listen (${webFrame.routingId})`)
    ipcRenderer.on("cluster:state", (event, model: ClusterState) => {
      this.applyWithoutSync(() => {
        logger.silly(`[CLUSTER-STORE]: received push-state at ${location.host} (${webFrame.routingId})`, model);
        this.getById(model.id)?.updateModel(model);
      })
    })
  }

  unregisterIpcListener() {
    super.unregisterIpcListener()
    ipcRenderer.removeAllListeners("cluster:state")
  }

  @computed get activeCluster(): Cluster | null {
    return this.getById(this.activeClusterId);
  }

  @computed get clustersList(): Cluster[] {
    return Array.from(this.clusters.values());
  }

  isActive(id: ClusterId) {
    return this.activeClusterId === id;
  }

  @action
  setActive(id: ClusterId) {
    this.activeClusterId = id;
  }

  @action
  swapIconOrders(workspace: WorkspaceId, from: number, to: number) {
    const clusters = this.getByWorkspaceId(workspace);
    if (from < 0 || to < 0 || from >= clusters.length || to >= clusters.length || isNaN(from) || isNaN(to)) {
      throw new Error(`invalid from<->to arguments`)
    }

    move.mutate(clusters, from, to);
    for (const i in clusters) {
      // This resets the iconOrder to the current display order
      clusters[i].preferences.iconOrder = +i;
    }
  }

  hasClusters() {
    return this.clusters.size > 0;
  }

  hasContextInWorkspace(name: string, workspaceId: string) {
    return this.clustersList.some(cluster => cluster.contextName === name && cluster.workspace === workspaceId);
  }

  getById(id: ClusterId): Cluster {
    return this.clusters.get(id);
  }

  getByWorkspaceId(workspaceId: string): Cluster[] {
    const clusters = Array.from(this.clusters.values())
      .filter(cluster => cluster.workspace === workspaceId);
    return _.sortBy(clusters, cluster => cluster.preferences.iconOrder)
  }

  @action
  addCluster(...models: ClusterModel[]) {
    models.forEach(model => {
      tracker.event("cluster", "add");
      const cluster = new Cluster(model);
      this.clusters.set(model.id, cluster);
    })
  }

  @action
  async removeById(clusterId: ClusterId) {
    tracker.event("cluster", "remove");
    const cluster = this.getById(clusterId);
    if (cluster) {
      this.clusters.delete(clusterId);
      if (this.activeClusterId === clusterId) {
        this.activeClusterId = null;
      }
      // remove only custom kubeconfigs (pasted as text)
      if (cluster.kubeConfigPath == ClusterStore.getCustomKubeConfigPath(clusterId)) {
        unlink(cluster.kubeConfigPath).catch(() => null);
      }
    }
  }

  @action
  removeByWorkspaceId(workspaceId: string) {
    this.getByWorkspaceId(workspaceId).forEach(cluster => {
      this.removeById(cluster.id)
    })
  }

  @action
  protected fromStore({ activeCluster, clusters = [] }: ClusterStoreModel = {}) {
    const currentClusters = this.clusters.toJS();
    const newClusters = new Map<ClusterId, Cluster>();
    const removedClusters = new Map<ClusterId, Cluster>();

    // update new clusters
    for (const clusterModel of clusters) {
      let cluster = currentClusters.get(clusterModel.id);
      if (cluster) {
        cluster.updateModel(clusterModel);
      } else {
        cluster = new Cluster(clusterModel);
      }
      newClusters.set(clusterModel.id, cluster);
    }

    // update removed clusters
    currentClusters.forEach(cluster => {
      if (!newClusters.has(cluster.id)) {
        removedClusters.set(cluster.id, cluster);
      }
    });

    this.activeClusterId = newClusters.has(activeCluster) ? activeCluster : null;
    this.clusters.replace(newClusters);
    this.removedClusters.replace(removedClusters);
  }

  toJSON(): ClusterStoreModel {
    return toJS({
      activeCluster: this.activeClusterId,
      clusters: this.clustersList.map(cluster => cluster.toJSON()),
    }, {
      recurseEverything: true
    })
  }
}

export const clusterStore = ClusterStore.getInstance<ClusterStore>();

export function getClusterIdFromHost(hostname: string): ClusterId {
  const subDomains = hostname.split(":")[0].split(".");
  return subDomains.slice(-2)[0]; // e.g host == "%clusterId.localhost:45345"
}

export function getClusterFrameUrl(clusterId: ClusterId) {
  return `//${clusterId}.${location.host}`;
}

export function getHostedClusterId() {
  return getClusterIdFromHost(location.hostname);
}

export function getHostedCluster(): Cluster {
  return clusterStore.getById(getHostedClusterId());
}

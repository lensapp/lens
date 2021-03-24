import { workspaceStore } from "./workspace-store";
import path from "path";
import { app, ipcRenderer, remote, webFrame } from "electron";
import { unlink } from "fs-extra";
import { action, comparer, computed, observable, reaction, toJS } from "mobx";
import { BaseStore } from "./base-store";
import { Cluster, ClusterState } from "../main/cluster";
import migrations from "../migrations/cluster-store";
import logger from "../main/logger";
import { appEventBus } from "./event-bus";
import { dumpConfigYaml } from "./kube-helpers";
import { saveToAppFiles } from "./utils/saveToAppFiles";
import { KubeConfig } from "@kubernetes/client-node";
import { handleRequest, requestMain, subscribeToBroadcast, unsubscribeAllFromBroadcast } from "./ipc";
import _ from "lodash";
import move from "array-move";
import type { WorkspaceId } from "./workspace-store";
import { ResourceType } from "../renderer/components/+cluster-settings/components/cluster-metrics-setting";

export interface ClusterIconUpload {
  clusterId: string;
  name: string;
  path: string;
}

export interface ClusterMetadata {
  [key: string]: string | number | boolean | object;
}

export type ClusterPrometheusMetadata = {
  success?: boolean;
  provider?: string;
  autoDetected?: boolean;
};

export interface ClusterStoreModel {
  activeCluster?: ClusterId; // last opened cluster
  clusters?: ClusterModel[];
}

export type ClusterId = string;

export interface ClusterModel {
  /** Unique id for a cluster */
  id: ClusterId;

  /** Path to cluster kubeconfig */
  kubeConfigPath: string;

  /** Workspace id */
  workspace?: WorkspaceId;

  /** User context in kubeconfig  */
  contextName?: string;

  /** Preferences */
  preferences?: ClusterPreferences;

  /** Metadata */
  metadata?: ClusterMetadata;

  /**
   * If extension sets ownerRef it has to explicitly mark a cluster as enabled during onActive (or when cluster is saved)
   */
  ownerRef?: string;

  /** List of accessible namespaces */
  accessibleNamespaces?: string[];

  /** @deprecated */
  kubeConfig?: string; // yaml
}

export interface ClusterPreferences extends ClusterPrometheusPreferences {
  terminalCWD?: string;
  clusterName?: string;
  iconOrder?: number;
  icon?: string;
  httpsProxy?: string;
  hiddenMetrics?: string[];
}

export interface ClusterPrometheusPreferences {
  prometheus?: {
    namespace: string;
    service: string;
    port: number;
    prefix: string;
  };
  prometheusProvider?: {
    type: string;
  };
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

  @observable activeCluster: ClusterId;
  @observable removedClusters = observable.map<ClusterId, Cluster>();
  @observable clusters = observable.map<ClusterId, Cluster>();

  private static stateRequestChannel = "cluster:states";

  private constructor() {
    super({
      configName: "lens-cluster-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
      migrations,
    });

    this.pushStateToViewsAutomatically();
  }

  async load() {
    await super.load();
    type clusterStateSync = {
      id: string;
      state: ClusterState;
    };

    if (ipcRenderer) {
      logger.info("[CLUSTER-STORE] requesting initial state sync");
      const clusterStates: clusterStateSync[] = await requestMain(ClusterStore.stateRequestChannel);

      clusterStates.forEach((clusterState) => {
        const cluster = this.getById(clusterState.id);

        if (cluster) {
          cluster.setState(clusterState.state);
        }
      });
    } else {
      handleRequest(ClusterStore.stateRequestChannel, (): clusterStateSync[] => {
        const states: clusterStateSync[] = [];

        this.clustersList.forEach((cluster) => {
          states.push({
            state: cluster.getState(),
            id: cluster.id
          });
        });

        return states;
      });
    }
  }

  protected pushStateToViewsAutomatically() {
    if (!ipcRenderer) {
      reaction(() => this.enabledClustersList, () => {
        this.pushState();
      });
      reaction(() => this.connectedClustersList, () => {
        this.pushState();
      });
    }
  }

  registerIpcListener() {
    logger.info(`[CLUSTER-STORE] start to listen (${webFrame.routingId})`);
    subscribeToBroadcast("cluster:state", (event, clusterId: string, state: ClusterState) => {
      logger.silly(`[CLUSTER-STORE]: received push-state at ${location.host} (${webFrame.routingId})`, clusterId, state);
      this.getById(clusterId)?.setState(state);
    });
  }

  unregisterIpcListener() {
    super.unregisterIpcListener();
    unsubscribeAllFromBroadcast("cluster:state");
  }

  pushState() {
    this.clusters.forEach((c) => {
      c.pushState();
    });
  }

  get activeClusterId() {
    return this.activeCluster;
  }

  @computed get clustersList(): Cluster[] {
    return Array.from(this.clusters.values());
  }

  @computed get enabledClustersList(): Cluster[] {
    return this.clustersList.filter((c) => c.enabled);
  }

  @computed get active(): Cluster | null {
    return this.getById(this.activeCluster);
  }

  @computed get connectedClustersList(): Cluster[] {
    return this.clustersList.filter((c) => !c.disconnected);
  }

  isActive(id: ClusterId) {
    return this.activeCluster === id;
  }

  isMetricHidden(resource: ResourceType) {
    return Boolean(this.active?.preferences.hiddenMetrics?.includes(resource));
  }

  @action
  setActive(id: ClusterId) {
    const clusterId = this.clusters.has(id) ? id : null;

    this.activeCluster = clusterId;
    workspaceStore.setLastActiveClusterId(clusterId);
  }

  deactivate(id: ClusterId) {
    if (this.isActive(id)) {
      this.setActive(null);
    }
  }

  @action
  swapIconOrders(workspace: WorkspaceId, from: number, to: number) {
    const clusters = this.getByWorkspaceId(workspace);

    if (from < 0 || to < 0 || from >= clusters.length || to >= clusters.length || isNaN(from) || isNaN(to)) {
      throw new Error(`invalid from<->to arguments`);
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

  getById(id: ClusterId): Cluster {
    return this.clusters.get(id);
  }

  getByWorkspaceId(workspaceId: string): Cluster[] {
    const clusters = Array.from(this.clusters.values())
      .filter(cluster => cluster.workspace === workspaceId);

    return _.sortBy(clusters, cluster => cluster.preferences.iconOrder);
  }

  @action
  addClusters(...models: ClusterModel[]): Cluster[] {
    const clusters: Cluster[] = [];

    models.forEach(model => {
      clusters.push(this.addCluster(model));
    });

    return clusters;
  }

  @action
  addCluster(model: ClusterModel | Cluster): Cluster {
    appEventBus.emit({ name: "cluster", action: "add" });
    let cluster = model as Cluster;

    if (!(model instanceof Cluster)) {
      cluster = new Cluster(model);
    }

    if (!cluster.isManaged) {
      cluster.enabled = true;
    }
    this.clusters.set(model.id, cluster);

    return cluster;
  }

  async removeCluster(model: ClusterModel) {
    await this.removeById(model.id);
  }

  @action
  async removeById(clusterId: ClusterId) {
    appEventBus.emit({ name: "cluster", action: "remove" });
    const cluster = this.getById(clusterId);

    if (cluster) {
      this.clusters.delete(clusterId);

      if (this.activeCluster === clusterId) {
        this.setActive(null);
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
      this.removeById(cluster.id);
    });
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

        if (!cluster.isManaged && cluster.apiUrl) {
          cluster.enabled = true;
        }
      }
      newClusters.set(clusterModel.id, cluster);
    }

    // update removed clusters
    currentClusters.forEach(cluster => {
      if (!newClusters.has(cluster.id)) {
        removedClusters.set(cluster.id, cluster);
      }
    });

    this.activeCluster = newClusters.get(activeCluster)?.enabled ? activeCluster : null;
    this.clusters.replace(newClusters);
    this.removedClusters.replace(removedClusters);
  }

  toJSON(): ClusterStoreModel {
    return toJS({
      activeCluster: this.activeCluster,
      clusters: this.clustersList.map(cluster => cluster.toJSON()),
    }, {
      recurseEverything: true
    });
  }
}

export const clusterStore = ClusterStore.getInstance<ClusterStore>();

export function getClusterIdFromHost(host: string): ClusterId | undefined {
  // e.g host == "%clusterId.localhost:45345"
  const subDomains = host.split(":")[0].split(".");

  return subDomains.slice(-2, -1)[0]; // ClusterId or undefined
}

export function getClusterFrameUrl(clusterId: ClusterId) {
  return `//${clusterId}.${location.host}`;
}

export function getHostedClusterId() {
  return getClusterIdFromHost(location.host);
}

export function getHostedCluster(): Cluster {
  return clusterStore.getById(getHostedClusterId());
}

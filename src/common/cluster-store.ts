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
import { broadcastMessage, handleRequest, InvalidKubeconfigChannel, requestMain, subscribeToBroadcast, unsubscribeAllFromBroadcast } from "./ipc";
import _ from "lodash";
import move from "array-move";
import type { WorkspaceId } from "./workspace-store";
import { ResourceType } from "../renderer/components/+cluster-settings/components/cluster-metrics-setting";
import { LensExtensionId } from "../extensions/lens-extension";

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
  activeClusterId?: ClusterId; // last opened cluster
  clusters?: ClusterModel[];
  clusterOwners?: [ClusterId, LensExtensionId][];
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

  /** List of accessible namespaces */
  accessibleNamespaces?: string[];

  /** @deprecated */
  kubeConfig?: string; // yaml
}

export interface ClusterManagementRecord {
  ownerId: LensExtensionId;
  enabled: boolean;
}

export interface GetByWorkspaceIdOptions {
  includeDisabled?: boolean; // default false
  sortByIconOrder?: boolean; // default true
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

function splitAddClusterArgs(args: ClusterModel[] | [...ClusterModel[], string]): [ClusterModel[]] | [ClusterModel[], string] {
  const lastArg = args.pop();

  if (lastArg) {
    return [[]];
  }

  if (typeof lastArg === "string") {
    return [args as ClusterModel[], lastArg];
  }

  args.push(lastArg);

  return [args as ClusterModel[]];
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

  @observable activeClusterId: ClusterId;
  @observable removedClusters = observable.map<ClusterId, Cluster>();
  @observable clusters = observable.map<ClusterId, Cluster>();
  @observable clusterManagingInfo = observable.map<ClusterId, ClusterManagementRecord>();
  @observable erroredClusterModels = observable.array<ClusterModel>();

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

  @computed get clustersList(): Cluster[] {
    return Array.from(this.clusters.values());
  }

  @computed get enabledClustersList(): Cluster[] {
    return this.clustersList.filter(c => this.isClusterEnabled(c));
  }

  @computed get active(): Cluster | null {
    return this.getById(this.activeClusterId);
  }

  @computed get connectedClustersList(): Cluster[] {
    return this.clustersList.filter((c) => !c.disconnected);
  }

  /**
   *
   * @param clusterOrId The cluster or its ID to check if it is owned
   * @returns true if an extension has claimed to be managing a cluster
   */
  isClusterManaged(clusterOrId: Cluster | ClusterId): boolean {
    const clusterId = typeof clusterOrId === "string"
      ? clusterOrId
      : clusterOrId.id;

    return this.clusterManagingInfo.has(clusterId);
  }

  /**
   * Get the enabled status of a cluster
   * @param clusterOrId The cluster or its ID to check if it is owned
   * @returns true if not managed, else true if owner has marked as enabled
   */
  isClusterEnabled(clusterOrId: Cluster | ClusterId): boolean {
    const clusterId = typeof clusterOrId === "string"
      ? clusterOrId
      : clusterOrId.id;

    return this.clusterManagingInfo.get(clusterId)?.enabled ?? true;
  }

  isActive(id: ClusterId) {
    return this.activeClusterId === id;
  }

  isMetricHidden(resource: ResourceType) {
    return Boolean(this.active?.preferences.hiddenMetrics?.includes(resource));
  }

  @action
  setActive(id: ClusterId) {
    const clusterId = this.clusters.has(id) ? id : null;

    this.activeClusterId = clusterId;
    workspaceStore.setLastActiveClusterId(clusterId);
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

  getByWorkspaceId(workspaceId: string, options?: GetByWorkspaceIdOptions): Cluster[] {
    const includeDisabled = options?.includeDisabled ?? false;
    const sortByIconOrder = options?.sortByIconOrder ?? true;

    const clusters = Array.from(this.clusters.values())
      .filter(cluster => (
        cluster.workspace === workspaceId
        && (
          includeDisabled
          || this.isClusterEnabled(cluster)
        )
      ));

    if (sortByIconOrder) {
      return _.sortBy(clusters, cluster => cluster.preferences.iconOrder);
    }

    return clusters;
  }

  @action
  addClusters<M extends ClusterModel, MM extends M[]>(...args: ([...MM] | [...MM, LensExtensionId])): Cluster[] {
    const [models, ownerId] = splitAddClusterArgs(args);

    return models.map(model => this.addCluster(model, ownerId));
  }

  @action
  addCluster(clusterOrModel: ClusterModel | Cluster, ownerId?: LensExtensionId): Cluster {
    appEventBus.emit({ name: "cluster", action: "add" });

    const cluster = clusterOrModel instanceof Cluster
      ? clusterOrModel
      : new Cluster(clusterOrModel);

    if (ownerId) {
      if (this.isClusterManaged(cluster)) {
        throw new Error("Extension tried to claim an already managed cluster");
      }

      this.clusterManagingInfo.set(cluster.id, { ownerId, enabled: false });
    }

    this.clusters.set(clusterOrModel.id, cluster);

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

      if (this.activeClusterId === clusterId) {
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
    const workspaceClusters = this.getByWorkspaceId(workspaceId, {
      includeDisabled: true,
      sortByIconOrder: false,
    });

    for (const cluster of workspaceClusters) {
      this.removeById(cluster.id);
    }
  }

  @action
  protected fromStore({ activeClusterId, clusters = [], clusterOwners = [] }: ClusterStoreModel = {}) {
    const currentClusters = this.clusters.toJS();
    const newClusters = new Map<ClusterId, Cluster>();
    const removedClusters = new Map<ClusterId, Cluster>();
    const erroredClusterModels: ClusterModel[] = [];
    const clusterOwnersMap = new Map<ClusterId, LensExtensionId>(clusterOwners);

    // update new clusters
    for (const clusterModel of clusters) {
      if (currentClusters.has(clusterModel.id)) {
        const cluster = currentClusters.get(clusterModel.id);

        cluster.updateModel(clusterModel);
        newClusters.set(clusterModel.id, cluster);
      } else {
        try {
          newClusters.set(clusterModel.id, new Cluster(clusterModel));
        } catch (error) {
          const { preferences, contextName: context, kubeConfigPath: kubeconfig } = clusterModel;
          const clusterName = preferences?.clusterName || context;

          logger.error(`[CLUSTER-STORE]: Failed to load kubeconfig for the cluster '${clusterName}'.`, { error, context, kubeconfig });
          broadcastMessage(InvalidKubeconfigChannel, clusterModel.id);
          erroredClusterModels.push(clusterModel);
        }
      }
    }

    // update removed clusters
    currentClusters.forEach(cluster => {
      if (!newClusters.has(cluster.id)) {
        removedClusters.set(cluster.id, cluster);
      }
    });

    this.activeClusterId = clusterOwnersMap.get(activeClusterId) ? null : activeClusterId;
    this.clusters.replace(newClusters);
    this.removedClusters.replace(removedClusters);
    this.erroredClusterModels.replace(erroredClusterModels);
    this.clusterManagingInfo.replace(clusterOwnersMap);
  }

  toJSON(): ClusterStoreModel {
    return toJS({
      activeClusterId: this.activeClusterId,
      clusters: this.clustersList.map(cluster => cluster.toJSON()).concat(this.erroredClusterModels),
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

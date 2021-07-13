/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import path from "path";
import { app, ipcMain, ipcRenderer, remote, webFrame } from "electron";
import { action, comparer, computed, makeObservable, observable, reaction } from "mobx";
import { BaseStore } from "./base-store";
import { Cluster, ClusterState } from "../main/cluster";
import migrations from "../migrations/cluster-store";
import * as uuid from "uuid";
import logger from "../main/logger";
import { appEventBus } from "./event-bus";
import { ipcMainHandle, ipcMainOn, ipcRendererOn, requestMain } from "./ipc";
import { disposer, toJS } from "./utils";

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
  clusters?: ClusterModel[];
}

export type ClusterId = string;

export interface UpdateClusterModel extends Omit<ClusterModel, "id"> {
  id?: ClusterId;
}

export interface ClusterModel {
  /** Unique id for a cluster */
  id: ClusterId;

  /** Path to cluster kubeconfig */
  kubeConfigPath: string;

  /**
   * Workspace id
   *
   * @deprecated
   */
  workspace?: string;

  /**
   * @deprecated this is used only for hotbar migrations from 4.2.X
   */
  workspaces?: string[];

  /** User context in kubeconfig  */
  contextName: string;

  /** Preferences */
  preferences?: ClusterPreferences;

  /** Metadata */
  metadata?: ClusterMetadata;

  /**
   * Labels for the catalog entity
   */
  labels?: Record<string, string>;

  /** List of accessible namespaces */
  accessibleNamespaces?: string[];
}

export interface ClusterPreferences extends ClusterPrometheusPreferences {
  terminalCWD?: string;
  clusterName?: string;
  iconOrder?: number;
  icon?: string;
  httpsProxy?: string;
  hiddenMetrics?: string[];
  nodeShellImage?: string;
  imagePullSecret?: string;
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

const initialStates = "cluster:states";

export const initialNodeShellImage = "docker.io/alpine:3.13";

export class ClusterStore extends BaseStore<ClusterStoreModel> {
  private static StateChannel = "cluster:state";

  static get storedKubeConfigFolder(): string {
    return path.resolve((app ?? remote.app).getPath("userData"), "kubeconfigs");
  }

  static getCustomKubeConfigPath(clusterId: ClusterId = uuid.v4()): string {
    return path.resolve(ClusterStore.storedKubeConfigFolder, clusterId);
  }

  clusters = observable.map<ClusterId, Cluster>();
  removedClusters = observable.map<ClusterId, Cluster>();

  protected disposer = disposer();

  constructor() {
    super({
      configName: "lens-cluster-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
      migrations,
    });

    makeObservable(this);
    this.load();
    this.pushStateToViewsAutomatically();
  }

  async loadInitialOnRenderer() {
    logger.info("[CLUSTER-STORE] requesting initial state sync");

    for (const { id, state } of await requestMain(initialStates)) {
      this.getById(id)?.setState(state);
    }
  }

  provideInitialFromMain() {
    ipcMainHandle(initialStates, () => {
      return this.clustersList.map(cluster => ({
        id: cluster.id,
        state: cluster.getState(),
      }));
    });
  }

  protected pushStateToViewsAutomatically() {
    if (ipcMain) {
      this.disposer.push(
        reaction(() => this.connectedClustersList, () => this.pushState()),
      );
    }
  }

  handleStateChange = (event: any, clusterId: string, state: ClusterState) => {
    logger.silly(`[CLUSTER-STORE]: received push-state at ${location.host} (${webFrame.routingId})`, clusterId, state);
    this.getById(clusterId)?.setState(state);
  };

  registerIpcListener() {
    logger.info(`[CLUSTER-STORE] start to listen (${webFrame.routingId})`);

    if (ipcMain) {
      this.disposer.push(ipcMainOn(ClusterStore.StateChannel, this.handleStateChange));
    }

    if (ipcRenderer) {
      this.disposer.push(ipcRendererOn(ClusterStore.StateChannel, this.handleStateChange));
    }
  }

  unregisterIpcListener() {
    super.unregisterIpcListener();
    this.disposer();
  }

  pushState() {
    this.clusters.forEach((c) => {
      c.pushState();
    });
  }

  @computed get clustersList(): Cluster[] {
    return Array.from(this.clusters.values());
  }

  @computed get connectedClustersList(): Cluster[] {
    return this.clustersList.filter((c) => !c.disconnected);
  }

  hasClusters() {
    return this.clusters.size > 0;
  }

  getById(id: ClusterId): Cluster | null {
    return this.clusters.get(id) ?? null;
  }

  addCluster(clusterOrModel: ClusterModel | Cluster): Cluster {
    appEventBus.emit({ name: "cluster", action: "add" });

    const cluster = clusterOrModel instanceof Cluster
      ? clusterOrModel
      : new Cluster(clusterOrModel);

    this.clusters.set(cluster.id, cluster);

    return cluster;
  }

  @action
  protected fromStore({ clusters = [] }: ClusterStoreModel = {}) {
    const currentClusters = new Map(this.clusters);
    const newClusters = new Map<ClusterId, Cluster>();
    const removedClusters = new Map<ClusterId, Cluster>();

    // update new clusters
    for (const clusterModel of clusters) {
      try {
        let cluster = currentClusters.get(clusterModel.id);

        if (cluster) {
          cluster.updateModel(clusterModel);
        } else {
          cluster = new Cluster(clusterModel);
        }
        newClusters.set(clusterModel.id, cluster);
      } catch (error) {
        logger.warn(`[CLUSTER-STORE]: Failed to update/create a cluster: ${error}`);
      }
    }

    // update removed clusters
    currentClusters.forEach(cluster => {
      if (!newClusters.has(cluster.id)) {
        removedClusters.set(cluster.id, cluster);
      }
    });

    this.clusters.replace(newClusters);
    this.removedClusters.replace(removedClusters);
  }

  toJSON(): ClusterStoreModel {
    return toJS({
      clusters: this.clustersList.map(cluster => cluster.toJSON()),
    });
  }
}

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
  return ClusterStore.getInstance().getById(getHostedClusterId());
}

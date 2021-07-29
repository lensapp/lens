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

import { ipcMain, ipcRenderer, webFrame } from "electron";
import { action, comparer, computed, makeObservable, observable, reaction } from "mobx";
import { BaseStore } from "./base-store";
import { Cluster } from "../main/cluster";
import migrations from "../migrations/cluster-store";
import logger from "../main/logger";
import { appEventBus } from "./event-bus";
import { ipcMainHandle, ipcMainOn, ipcRendererOn, requestMain } from "./ipc";
import { disposer, toJS } from "./utils";
import type { ClusterModel, ClusterId, ClusterState } from "./cluster-types";

export interface ClusterStoreModel {
  clusters?: ClusterModel[];
}

const initialStates = "cluster:states";

export class ClusterStore extends BaseStore<ClusterStoreModel> {
  private static StateChannel = "cluster:state";

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

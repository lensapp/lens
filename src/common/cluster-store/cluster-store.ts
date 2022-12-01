/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import { ipcMain, ipcRenderer, webFrame } from "electron";
import { action, comparer, computed, makeObservable, observable, reaction } from "mobx";
import type { BaseStoreDependencies } from "../base-store/base-store";
import { BaseStore } from "../base-store/base-store";
import { Cluster } from "../cluster/cluster";
import { disposer, toJS } from "../utils";
import type { ClusterModel, ClusterId, ClusterState } from "../cluster-types";
import { requestInitialClusterStates } from "../../renderer/ipc";
import type { CreateCluster } from "../cluster/create-cluster-injection-token";
import type { ReadClusterConfigSync } from "./read-cluster-config.injectable";
import type { EmitAppEvent } from "../app-event-bus/emit-event.injectable";

export interface ClusterStoreModel {
  clusters?: ClusterModel[];
}

interface Dependencies extends BaseStoreDependencies {
  createCluster: CreateCluster;
  readClusterConfigSync: ReadClusterConfigSync;
  emitAppEvent: EmitAppEvent;
}

export class ClusterStore extends BaseStore<ClusterStoreModel> {
  readonly clusters = observable.map<ClusterId, Cluster>();

  protected readonly disposer = disposer();

  constructor(protected readonly dependencies: Dependencies) {
    super(dependencies, {
      configName: "lens-cluster-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
    });

    makeObservable(this);
    this.load();
    this.pushStateToViewsAutomatically();
  }

  async loadInitialOnRenderer() {
    this.dependencies.logger.info("[CLUSTER-STORE] requesting initial state sync");

    for (const { id, state } of await requestInitialClusterStates()) {
      this.getById(id)?.setState(state);
    }
  }

  protected pushStateToViewsAutomatically() {
    if (ipcMain) {
      this.disposer.push(
        reaction(() => this.connectedClustersList, () => this.pushState()),
      );
    }
  }

  registerIpcListener() {
    this.dependencies.logger.info(`[CLUSTER-STORE] start to listen (${webFrame.routingId})`);
    const ipc = ipcMain ?? ipcRenderer;

    ipc?.on("cluster:state", (event, clusterId: ClusterId, state: ClusterState) => {
      this.getById(clusterId)?.setState(state);
    });
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

  getById(id: ClusterId | undefined): Cluster | undefined {
    if (id) {
      return this.clusters.get(id);
    }

    return undefined;
  }

  addCluster(clusterOrModel: ClusterModel | Cluster): Cluster {
    this.dependencies.emitAppEvent({ name: "cluster", action: "add" });

    const cluster = clusterOrModel instanceof Cluster
      ? clusterOrModel
      : this.dependencies.createCluster(
        clusterOrModel,
        this.dependencies.readClusterConfigSync(clusterOrModel),
      );

    this.clusters.set(cluster.id, cluster);

    return cluster;
  }

  @action
  protected fromStore({ clusters = [] }: ClusterStoreModel = {}) {
    const currentClusters = new Map(this.clusters);
    const newClusters = new Map<ClusterId, Cluster>();

    // update new clusters
    for (const clusterModel of clusters) {
      try {
        let cluster = currentClusters.get(clusterModel.id);

        if (cluster) {
          cluster.updateModel(clusterModel);
        } else {
          cluster = this.dependencies.createCluster(
            clusterModel,
            this.dependencies.readClusterConfigSync(clusterModel),
          );
        }
        newClusters.set(clusterModel.id, cluster);
      } catch (error) {
        this.dependencies.logger.warn(`[CLUSTER-STORE]: Failed to update/create a cluster: ${error}`);
      }
    }

    this.clusters.replace(newClusters);
  }

  toJSON(): ClusterStoreModel {
    return toJS({
      clusters: this.clustersList.map(cluster => cluster.toJSON()),
    });
  }
}

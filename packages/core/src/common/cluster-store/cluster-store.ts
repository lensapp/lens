/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import { action, comparer, computed, makeObservable, observable } from "mobx";
import type { BaseStoreDependencies } from "../base-store/base-store";
import { BaseStore } from "../base-store/base-store";
import { Cluster } from "../cluster/cluster";
import { toJS } from "../utils";
import type { ClusterModel, ClusterId } from "../cluster-types";
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

  constructor(protected readonly dependencies: Dependencies) {
    super(dependencies, {
      configName: "lens-cluster-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
    });

    makeObservable(this);
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

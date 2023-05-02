/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "../../common/ipc/cluster";
import type { IComputedValue, IObservableValue, ObservableSet } from "mobx";
import { action, makeObservable, observe, reaction, toJS } from "mobx";
import type { Cluster } from "../../common/cluster/cluster";
import { isKubernetesCluster, KubernetesCluster, LensKubernetesClusterStatus } from "../../common/catalog-entities/kubernetes-cluster";
import { ipcMainOn } from "../../common/ipc";
import { once } from "lodash";
import type { ClusterId } from "../../common/cluster-types";
import type { CatalogEntityRegistry } from "../catalog";
import type { Logger } from "@k8slens/logger";
import type { UpdateEntityMetadata } from "./update-entity-metadata.injectable";
import type { UpdateEntitySpec } from "./update-entity-spec.injectable";
import type { ClusterConnection } from "./cluster-connection.injectable";
import type { GetClusterById } from "../../features/cluster/storage/common/get-by-id.injectable";
import type { AddCluster } from "../../features/cluster/storage/common/add.injectable";

const logPrefix = "[CLUSTER-MANAGER]:";

const lensSpecificClusterStatuses: Set<string> = new Set(Object.values(LensKubernetesClusterStatus));

interface Dependencies {
  readonly catalogEntityRegistry: CatalogEntityRegistry;
  readonly clustersThatAreBeingDeleted: ObservableSet<ClusterId>;
  readonly visibleCluster: IObservableValue<ClusterId | null>;
  readonly logger: Logger;
  readonly clusters: IComputedValue<Cluster[]>;
  updateEntityMetadata: UpdateEntityMetadata;
  updateEntitySpec: UpdateEntitySpec;
  getClusterConnection: (cluster: Cluster) => ClusterConnection;
  getClusterById: GetClusterById;
  addCluster: AddCluster;
}

export class ClusterManager {
  constructor(private readonly dependencies: Dependencies) {
    makeObservable(this);
  }

  init = once(() => {
    // reacting to every cluster's state change and total amount of items
    reaction(
      () => this.dependencies.clusters.get().map(c => c.getState()),
      () => this.updateCatalog(this.dependencies.clusters.get()),
      { fireImmediately: false },
    );

    // reacting to every cluster's preferences change and total amount of items
    reaction(
      () => this.dependencies.clusters.get().map(c => toJS(c.preferences)),
      () => this.updateCatalog(this.dependencies.clusters.get()),
      { fireImmediately: false },
    );

    reaction(
      () => this.dependencies.catalogEntityRegistry.filterItemsByPredicate(isKubernetesCluster),
      entities => this.syncClustersFromCatalog(entities),
    );

    reaction(() => [
      this.dependencies.catalogEntityRegistry.filterItemsByPredicate(isKubernetesCluster),
      this.dependencies.visibleCluster.get(),
    ] as const, ([entities, visibleCluster]) => {
      for (const entity of entities) {
        if (entity.getId() === visibleCluster) {
          entity.status.active = true;
        } else {
          entity.status.active = false;
        }
      }
    });

    observe(this.dependencies.clustersThatAreBeingDeleted, change => {
      if (change.type === "add") {
        this.updateEntityStatus(this.dependencies.catalogEntityRegistry.findById(change.newValue) as KubernetesCluster);
      }
    });

    ipcMainOn("network:offline", this.onNetworkOffline);
    ipcMainOn("network:online", this.onNetworkOnline);
  });

  @action
  protected updateCatalog(clusters: Cluster[]) {
    this.dependencies.logger.debug("[CLUSTER-MANAGER]: updating catalog from cluster store");

    for (const cluster of clusters) {
      this.updateEntityFromCluster(cluster);
    }
  }

  protected updateEntityFromCluster(cluster: Cluster) {
    const index = this.dependencies.catalogEntityRegistry.items.findIndex((entity) => entity.getId() === cluster.id);

    if (index === -1) {
      return;
    }

    const entity = this.dependencies.catalogEntityRegistry.items[index] as KubernetesCluster;

    this.updateEntityStatus(entity, cluster);

    this.dependencies.updateEntityMetadata(entity, cluster);
    this.dependencies.updateEntitySpec(entity, cluster);

    this.dependencies.catalogEntityRegistry.items.splice(index, 1, entity);
  }

  @action
  protected updateEntityStatus(entity: KubernetesCluster, cluster?: Cluster) {
    if (this.dependencies.clustersThatAreBeingDeleted.has(entity.getId())) {
      entity.status.phase = LensKubernetesClusterStatus.DELETING;
      entity.status.enabled = false;
    } else {
      entity.status.phase = (() => {
        if (!cluster) {
          this.dependencies.logger.silly(`${logPrefix} setting entity ${entity.getName()} to DISCONNECTED, reason="no cluster"`);

          return LensKubernetesClusterStatus.DISCONNECTED;
        }

        if (cluster.accessible.get()) {
          this.dependencies.logger.silly(`${logPrefix} setting entity ${entity.getName()} to CONNECTED, reason="cluster is accessible"`);

          return LensKubernetesClusterStatus.CONNECTED;
        }

        if (!cluster.disconnected.get()) {
          this.dependencies.logger.silly(`${logPrefix} setting entity ${entity.getName()} to CONNECTING, reason="cluster is not disconnected"`);

          return LensKubernetesClusterStatus.CONNECTING;
        }

        // Extensions are not allowed to use the Lens specific status phases
        if (!lensSpecificClusterStatuses.has(entity?.status?.phase)) {
          this.dependencies.logger.silly(`${logPrefix} not clearing entity ${entity.getName()} status, reason="custom string"`);

          return entity.status.phase;
        }

        this.dependencies.logger.silly(`${logPrefix} setting entity ${entity.getName()} to DISCONNECTED, reason="fallthrough"`);

        return LensKubernetesClusterStatus.DISCONNECTED;
      })();

      entity.status.enabled = true;
    }
  }

  @action
  protected syncClustersFromCatalog(entities: KubernetesCluster[]) {
    for (const entity of entities) {
      const cluster = this.dependencies.getClusterById(entity.getId());

      if (!cluster) {
        this.dependencies.addCluster({
          id: entity.getId(),
          kubeConfigPath: entity.spec.kubeconfigPath,
          contextName: entity.spec.kubeconfigContext,
          accessibleNamespaces: entity.spec.accessibleNamespaces ?? [],
        });
      } else {
        cluster.kubeConfigPath.set(entity.spec.kubeconfigPath);
        cluster.contextName.set(entity.spec.kubeconfigContext);

        if (entity.spec.accessibleNamespaces) {
          cluster.accessibleNamespaces.replace(entity.spec.accessibleNamespaces);
        }

        if (entity.spec.metrics) {
          const { source, prometheus } = entity.spec.metrics;

          if (source !== "local" && prometheus) {
            const { type, address } = prometheus;

            if (type) {
              cluster.preferences.prometheusProvider = { type };
            }

            if (address) {
              cluster.preferences.prometheus = address;
            }
          }
        }

        this.updateEntityFromCluster(cluster);
      }
    }
  }

  protected onNetworkOffline = async () => {
    this.dependencies.logger.info(`${logPrefix} network is offline`);

    await Promise.allSettled(
      this.dependencies
        .clusters
        .get()
        .filter(cluster => !cluster.disconnected.get())
        .map(async (cluster) => {
          cluster.online.set(false);
          cluster.accessible.set(false);

          await this.dependencies
            .getClusterConnection(cluster)
            .refreshConnectionStatus();
        }),
    );
  };

  protected onNetworkOnline = async () => {
    this.dependencies.logger.info(`${logPrefix} network is online`);

    await Promise.allSettled(
      this.dependencies
        .clusters
        .get()
        .filter(cluster => !cluster.disconnected.get())
        .map((cluster) => (
          this.dependencies
            .getClusterConnection(cluster)
            .refreshConnectionStatus()
        )),
    );
  };
}

export function catalogEntityFromCluster(cluster: Cluster) {
  return new KubernetesCluster({
    metadata: {
      uid: cluster.id,
      name: cluster.name.get(),
      source: "local",
      labels: {
        ...cluster.labels,
      },
      distro: cluster.distribution.get(),
      kubeVersion: cluster.version.get(),
    },
    spec: {
      kubeconfigPath: cluster.kubeConfigPath.get(),
      kubeconfigContext: cluster.contextName.get(),
      icon: {},
    },
    status: {
      phase: cluster.disconnected.get()
        ? LensKubernetesClusterStatus.DISCONNECTED
        : LensKubernetesClusterStatus.CONNECTED,
      reason: "",
      message: "",
      active: !cluster.disconnected.get(),
    },
  });
}

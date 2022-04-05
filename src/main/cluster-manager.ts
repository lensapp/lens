/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "../common/ipc/cluster";
import type http from "http";
import { action, makeObservable, observable, observe, reaction, toJS } from "mobx";
import type { Cluster } from "../common/cluster/cluster";
import logger from "./logger";
import { apiKubePrefix } from "../common/vars";
import { getClusterIdFromHost, isErrnoException } from "../common/utils";
import type { KubernetesClusterPrometheusMetrics } from "../common/catalog-entities/kubernetes-cluster";
import { isKubernetesCluster, KubernetesCluster, LensKubernetesClusterStatus } from "../common/catalog-entities/kubernetes-cluster";
import { ipcMainOn } from "../common/ipc";
import { once } from "lodash";
import type { ClusterStore } from "../common/cluster-store/cluster-store";
import type { ClusterId } from "../common/cluster-types";
import type { CatalogEntityRegistry } from "./catalog";

const logPrefix = "[CLUSTER-MANAGER]:";

const lensSpecificClusterStatuses: Set<string> = new Set(Object.values(LensKubernetesClusterStatus));

interface Dependencies {
  readonly store: ClusterStore;
  readonly entityRegistry: CatalogEntityRegistry;
}

export class ClusterManager {
  deleting = observable.set<ClusterId>();

  @observable visibleCluster: ClusterId | undefined = undefined;

  constructor(protected readonly dependencies: Dependencies) {
    makeObservable(this);
  }

  init = once(() => {
    // reacting to every cluster's state change and total amount of items
    reaction(
      () => this.dependencies.store.clustersList.map(c => c.getState()),
      () => this.updateCatalog(this.dependencies.store.clustersList),
      { fireImmediately: false },
    );

    // reacting to every cluster's preferences change and total amount of items
    reaction(
      () => this.dependencies.store.clustersList.map(c => toJS(c.preferences)),
      () => this.updateCatalog(this.dependencies.store.clustersList),
      { fireImmediately: false },
    );

    reaction(
      () => this.dependencies.entityRegistry.filterItemsByPredicate(isKubernetesCluster),
      entities => this.syncClustersFromCatalog(entities),
    );

    reaction(() => [
      this.dependencies.entityRegistry.filterItemsByPredicate(isKubernetesCluster),
      this.visibleCluster,
    ] as const, ([entities, visibleCluster]) => {
      for (const entity of entities) {
        if (entity.getId() === visibleCluster) {
          entity.status.active = true;
        } else {
          entity.status.active = false;
        }
      }
    });

    observe(this.deleting, change => {
      if (change.type === "add") {
        this.updateEntityStatus(this.dependencies.entityRegistry.findById(change.newValue) as KubernetesCluster);
      }
    });

    ipcMainOn("network:offline", this.onNetworkOffline);
    ipcMainOn("network:online", this.onNetworkOnline);
  });

  @action
  protected updateCatalog(clusters: Cluster[]) {
    logger.debug("[CLUSTER-MANAGER]: updating catalog from cluster store");

    for (const cluster of clusters) {
      this.updateEntityFromCluster(cluster);
    }
  }

  protected updateEntityFromCluster(cluster: Cluster) {
    const index = this.dependencies.entityRegistry.items.findIndex((entity) => entity.getId() === cluster.id);

    if (index === -1) {
      return;
    }

    const entity = this.dependencies.entityRegistry.items[index] as KubernetesCluster;

    this.updateEntityStatus(entity, cluster);

    entity.metadata.labels = {
      ...entity.metadata.labels,
      ...cluster.labels,
    };
    entity.metadata.distro = cluster.distribution;
    entity.metadata.kubeVersion = cluster.version;

    if (cluster.preferences?.clusterName) {
      /**
       * Only set the name if the it is overriden in preferences. If it isn't
       * set then the name of the entity has been explicitly set by its source
       */
      entity.metadata.name = cluster.preferences.clusterName;
    }

    entity.spec.metrics ||= { source: "local" };

    if (entity.spec.metrics.source === "local") {
      const prometheus: KubernetesClusterPrometheusMetrics = entity.spec?.metrics?.prometheus || {};

      prometheus.type = cluster.preferences.prometheusProvider?.type;
      prometheus.address = cluster.preferences.prometheus;
      entity.spec.metrics.prometheus = prometheus;
    }

    if (cluster.preferences.icon) {
      entity.spec.icon ??= {};
      entity.spec.icon.src = cluster.preferences.icon;
    } else if (cluster.preferences.icon === null) {
      /**
       * NOTE: only clear the icon if set to `null` by ClusterIconSettings.
       * We can then also clear that value too
       */
      entity.spec.icon = undefined;
      cluster.preferences.icon = undefined;
    }

    this.dependencies.entityRegistry.items.splice(index, 1, entity);
  }

  @action
  protected updateEntityStatus(entity: KubernetesCluster, cluster?: Cluster) {
    if (this.deleting.has(entity.getId())) {
      entity.status.phase = LensKubernetesClusterStatus.DELETING;
      entity.status.enabled = false;
    } else {
      entity.status.phase = (() => {
        if (!cluster) {
          logger.debug(`${logPrefix} setting entity ${entity.getName()} to DISCONNECTED, reason="no cluster"`);

          return LensKubernetesClusterStatus.DISCONNECTED;
        }

        if (cluster.accessible) {
          logger.debug(`${logPrefix} setting entity ${entity.getName()} to CONNECTED, reason="cluster is accessible"`);

          return LensKubernetesClusterStatus.CONNECTED;
        }

        if (!cluster.disconnected) {
          logger.debug(`${logPrefix} setting entity ${entity.getName()} to CONNECTING, reason="cluster is not disconnected"`);

          return LensKubernetesClusterStatus.CONNECTING;
        }

        // Extensions are not allowed to use the Lens specific status phases
        if (!lensSpecificClusterStatuses.has(entity?.status?.phase)) {
          logger.debug(`${logPrefix} not clearing entity ${entity.getName()} status, reason="custom string"`);

          return entity.status.phase;
        }

        logger.debug(`${logPrefix} setting entity ${entity.getName()} to DISCONNECTED, reason="fallthrough"`);

        return LensKubernetesClusterStatus.DISCONNECTED;
      })();

      entity.status.enabled = true;
    }
  }

  @action
  protected syncClustersFromCatalog(entities: KubernetesCluster[]) {
    for (const entity of entities) {
      const cluster = this.dependencies.store.getById(entity.getId());

      if (!cluster) {
        const model = {
          id: entity.getId(),
          kubeConfigPath: entity.spec.kubeconfigPath,
          contextName: entity.spec.kubeconfigContext,
          accessibleNamespaces: entity.spec.accessibleNamespaces ?? [],
        };

        try {
          /**
           * Add the bare minimum of data to ClusterStore. And especially no
           * preferences, as those might be configured by the entity's source
           */
          this.dependencies.store.addCluster(model);
        } catch (error) {
          if (isErrnoException(error) && error.code === "ENOENT" && error.path === entity.spec.kubeconfigPath) {
            logger.warn(`${logPrefix} kubeconfig file disappeared`, model);
          } else {
            logger.error(`${logPrefix} failed to add cluster: ${error}`, model);
          }
        }
      } else {
        cluster.kubeConfigPath = entity.spec.kubeconfigPath;
        cluster.contextName = entity.spec.kubeconfigContext;

        if (entity.spec.accessibleNamespaces) {
          cluster.accessibleNamespaces = entity.spec.accessibleNamespaces;
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

  protected onNetworkOffline = () => {
    logger.info(`${logPrefix} network is offline`);
    this.dependencies.store.clustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        cluster.online = false;
        cluster.accessible = false;
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    });
  };

  protected onNetworkOnline = () => {
    logger.info(`${logPrefix} network is online`);
    this.dependencies.store.clustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    });
  };

  stop() {
    this.dependencies.store.clusters.forEach((cluster: Cluster) => {
      cluster.disconnect();
    });
  }

  getClusterForRequest = (req: http.IncomingMessage): Cluster | undefined => {
    if (!req.headers.host) {
      return undefined;
    }

    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.url && req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1];
      const cluster = this.dependencies.store.getById(clusterId);

      if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
        req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);
      }

      return cluster;
    }

    const clusterId = getClusterIdFromHost(req.headers.host);

    if (!clusterId) {
      return undefined;
    }

    return this.dependencies.store.getById(clusterId);
  };
}

export function catalogEntityFromCluster(cluster: Cluster) {
  return new KubernetesCluster({
    metadata: {
      uid: cluster.id,
      name: cluster.name,
      source: "local",
      labels: {
        ...cluster.labels,
      },
      distro: cluster.distribution,
      kubeVersion: cluster.version,
    },
    spec: {
      kubeconfigPath: cluster.kubeConfigPath,
      kubeconfigContext: cluster.contextName,
      icon: {},
    },
    status: {
      phase: cluster.disconnected
        ? LensKubernetesClusterStatus.DISCONNECTED
        : LensKubernetesClusterStatus.CONNECTED,
      reason: "",
      message: "",
      active: !cluster.disconnected,
    },
  });
}

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

import "../common/cluster-ipc";
import type http from "http";
import { action, autorun, makeObservable, observable, observe, reaction, toJS } from "mobx";
import { ClusterId, ClusterStore, getClusterIdFromHost } from "../common/cluster-store";
import { Cluster } from "./cluster";
import logger from "./logger";
import { apiKubePrefix } from "../common/vars";
import { Singleton } from "../common/utils";
import { catalogEntityRegistry } from "./catalog";
import { KubernetesCluster, KubernetesClusterPrometheusMetrics, KubernetesClusterStatusPhase } from "../common/catalog-entities/kubernetes-cluster";
import { ipcMainOn } from "../common/ipc";
import { once } from "lodash";

const logPrefix = "[CLUSTER-MANAGER]:";

export class ClusterManager extends Singleton {
  private store = ClusterStore.getInstance();
  deleting = observable.set<ClusterId>();

  constructor() {
    super();
    makeObservable(this);
  }

  init = once(() => {
    // reacting to every cluster's state change and total amount of items
    reaction(
      () => this.store.clustersList.map(c => c.getState()),
      () => this.updateCatalog(this.store.clustersList),
      { fireImmediately: false, }
    );

    // reacting to every cluster's preferences change and total amount of items
    reaction(
      () => this.store.clustersList.map(c => toJS(c.preferences)),
      () => this.updateCatalog(this.store.clustersList),
      { fireImmediately: false, }
    );

    reaction(() => catalogEntityRegistry.getItemsForApiKind<KubernetesCluster>("entity.k8slens.dev/v1alpha1", "KubernetesCluster"), (entities) => {
      this.syncClustersFromCatalog(entities);
    });

    observe(this.deleting, change => {
      if (change.type === "add") {
        this.updateEntityStatus(catalogEntityRegistry.getById(change.newValue));
      }
    });

    // auto-stop removed clusters
    autorun(() => {
      const removedClusters = Array.from(this.store.removedClusters.values());

      if (removedClusters.length > 0) {
        const meta = removedClusters.map(cluster => cluster.getMeta());

        logger.info(`${logPrefix} removing clusters`, meta);
        removedClusters.forEach(cluster => cluster.disconnect());
        this.store.removedClusters.clear();
      }
    }, {
      delay: 250
    });

    ipcMainOn("network:offline", this.onNetworkOffline);
    ipcMainOn("network:online", this.onNetworkOnline);
  });

  @action
  protected updateCatalog(clusters: Cluster[]) {
    for (const cluster of clusters) {
      this.updateEntityFromCluster(cluster);
    }
  }

  protected updateEntityFromCluster(cluster: Cluster) {
    const index = catalogEntityRegistry.items.findIndex((entity) => entity.metadata.uid === cluster.id);

    if (index === -1) {
      return;
    }

    const entity = catalogEntityRegistry.items[index] as KubernetesCluster;

    this.updateEntityStatus(entity, cluster);

    entity.metadata.labels = {
      ...entity.metadata.labels,
      ...cluster.labels,
    };
    entity.metadata.distro = cluster.distribution;
    entity.metadata.kubeVersion = cluster.version;
    entity.metadata.name = cluster.name;
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
    } else {
      entity.spec.icon = null;
    }

    catalogEntityRegistry.items.splice(index, 1, entity);
  }

  @action
  protected updateEntityStatus(entity: KubernetesCluster, cluster?: Cluster) {
    if (this.deleting.has(entity.getId())) {
      entity.status.phase = "deleting";
      entity.status.enabled = false;
    } else {
      entity.status.phase = ((): KubernetesClusterStatusPhase => {
        if (!cluster) {
          return "disconnected";
        }

        if (cluster.accessible) {
          return "connected";
        }

        if (!cluster.disconnected) {
          return "connecting";
        }

        return "disconnected";
      })();

      entity.status.enabled = true;
    }
  }

  @action syncClustersFromCatalog(entities: KubernetesCluster[]) {
    for (const entity of entities) {
      const cluster = this.store.getById(entity.metadata.uid);

      if (!cluster) {
        try {
          this.store.addCluster({
            id: entity.metadata.uid,
            preferences: {
              clusterName: entity.metadata.name
            },
            kubeConfigPath: entity.spec.kubeconfigPath,
            contextName: entity.spec.kubeconfigContext
          });
        } catch (error) {
          if (error.code === "ENOENT" && error.path === entity.spec.kubeconfigPath) {
            logger.warn(`${logPrefix} kubeconfig file disappeared`, { path: entity.spec.kubeconfigPath });
          } else {
            logger.error(`${logPrefix} failed to add cluster: ${error}`);
          }
        }
      } else {
        cluster.kubeConfigPath = entity.spec.kubeconfigPath;
        cluster.contextName = entity.spec.kubeconfigContext;

        this.updateEntityFromCluster(cluster);
      }
    }
  }

  protected onNetworkOffline = () => {
    logger.info(`${logPrefix} network is offline`);
    this.store.clustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        cluster.online = false;
        cluster.accessible = false;
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    });
  };

  protected onNetworkOnline = () => {
    logger.info(`${logPrefix} network is online`);
    this.store.clustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    });
  };

  stop() {
    this.store.clusters.forEach((cluster: Cluster) => {
      cluster.disconnect();
    });
  }

  getClusterForRequest(req: http.IncomingMessage): Cluster {
    let cluster: Cluster = null;

    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1];

      cluster = this.store.getById(clusterId);

      if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
        req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);
      }
    } else if (req.headers["x-cluster-id"]) {
      cluster = this.store.getById(req.headers["x-cluster-id"].toString());
    } else {
      const clusterId = getClusterIdFromHost(req.headers.host);

      cluster = this.store.getById(clusterId);
    }

    return cluster;
  }
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
      icon: {}
    },
    status: {
      phase: cluster.disconnected ? "disconnected" : "connected",
      reason: "",
      message: "",
      active: !cluster.disconnected
    }
  });
}

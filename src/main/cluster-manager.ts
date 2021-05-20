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
import { ipcMain } from "electron";
import { computed, makeObservable, observable } from "mobx";
import { ClusterModel, ClusterPreferencesStore, getClusterIdFromHost } from "../common/cluster-store";
import { Cluster } from "./cluster";
import logger from "./logger";
import { apiKubePrefix } from "../common/vars";
import { noop, Singleton } from "../common/utils";
import { CatalogCategoryRegistry, CatalogEntity } from "./catalog";
import type { KubernetesClusterSpec } from "../common/catalog-entities/kubernetes-cluster";
import type { CatalogEntityMetadata } from "../common/catalog";

export class ClusterManager extends Singleton {
  protected clusters = observable.map<string, Cluster>();

  constructor() {
    super();
    makeObservable(this);

    CatalogCategoryRegistry.getInstance().add({
      apiVersion: "catalog.k8slens.dev/v1alpha1",
      kind: "CatalogCategory",
      metadata: {
        name: "Kubernetes Clusters",
      },
      spec: {
        group: "entity.k8slens.dev",
        versions: [
          {
            version: "v1alpha1",
            getStatus: (entity: CatalogEntity<CatalogEntityMetadata, KubernetesClusterSpec>) => {
              const cluster = new Cluster({
                id: entity.metadata.uid,
                preferences: {
                  clusterName: entity.metadata.name
                },
                kubeConfigPath: entity.spec.kubeconfigPath,
                contextName: entity.spec.kubeconfigContext
              });

              this.clusters.set(entity.metadata.uid, cluster);

              return computed(() => ({
                phase: cluster.disconnected ? "disconnected" : "connected",
                active: !cluster.disconnected,
              }));
            },
          },
        ],
        names: {
          kind: "KubernetesCluster"
        }
      }
    });

    CatalogCategoryRegistry.getInstance().registerSpecEnhancer(
      "entity.k8slens.dev/v1alpha1",
      "KubernetesCluster",
      (entity: CatalogEntity<CatalogEntityMetadata, KubernetesClusterSpec>) => {
        if (entity.spec.metrics) {
          return computed(() => ({}));
        }

        const preferences = ClusterPreferencesStore.getInstance().getById(entity.metadata.uid);

        return computed(() => ({
          metrics: {
            source: "local",
            prometheus: {
              type: preferences.prometheusProvider?.type,
              address: preferences.prometheus,
            },
          }
        }));
      }
    );

    ipcMain.on("network:offline", this.onNetworkOffline);
    ipcMain.on("network:online", this.onNetworkOnline);
  }

  protected onNetworkOffline = () => {
    logger.info("[CLUSTER-MANAGER]: network is offline");

    for (const cluster of this.clusters.values()) {
      if (!cluster.disconnected) {
        cluster.online = false;
        cluster.accessible = false;
        cluster.refreshConnectionStatus().catch(noop);
      }
    }
  };

  protected onNetworkOnline = () => {
    logger.info("[CLUSTER-MANAGER]: network is online");

    for (const cluster of this.clusters.values()) {
      if (!cluster.disconnected) {
        cluster.refreshConnectionStatus().catch(noop);
      }
    }
  };

  stop() {
    for (const cluster of this.clusters.values()) {
      cluster.disconnect();
    }
  }

  getClusterForRequest(req: http.IncomingMessage): Cluster {
    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const cluster = this.clusters.get(req.url.split("/")[1]);

      if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
        req.url = req.url.replace(`/${cluster.id}`, apiKubePrefix);
      }

      return cluster;
    }

    if (req.headers["x-cluster-id"]) {
      return this.clusters.get(req.headers["x-cluster-id"].toString());
    }

    return this.clusters.get(getClusterIdFromHost(req.headers.host));
  }

  getById(id: string): Cluster {
    return this.clusters.get(id);
  }
}

export function catalogEntityFromCluster(cluster: ClusterModel): CatalogEntity<CatalogEntityMetadata, KubernetesClusterSpec> {
  return {
    apiVersion: "entity.k8slens.dev/v1alpha1",
    kind: "KubernetesCluster",
    metadata: {
      uid: cluster.id,
      name: cluster.contextName,
      source: "local",
      labels: {
        distro: cluster.metadata.distribution?.toString() || "unknown",
      }
    },
    spec: {
      kubeconfigPath: cluster.kubeConfigPath,
      kubeconfigContext: cluster.contextName
    },
  };
}

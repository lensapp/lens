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
import { ipcMain } from "electron";
import { action, computed, observable, reaction } from "mobx";
import { CatalogEntityRegistry } from "../common/catalog";
import type { KubernetesCluster, KubernetesClusterStatus } from "../common/catalog-entities/kubernetes-cluster";
import * as ClusterChannels from "../common/cluster-ipc";
import { appEventBus } from "../common/event-bus";
import { iter, noop, Singleton } from "../common/utils";
import { apiKubePrefix } from "../common/vars";
import { Cluster } from "./cluster";
import logger from "./logger";
import { ResourceApplier } from "./resource-applier";
import type http from "http";
import { ClusterId, getClusterIdFromHost } from "../common/cluster-types";

export type ClusterFrameInfo = {
  frameId: number;
  processId: number
};

export class ClusterManager extends Singleton {
  protected clusterInstances = observable.map<ClusterId, Cluster>();
  protected clusterFrameMap = observable.map<string, ClusterFrameInfo>();

  constructor() {
    super();

    reaction(() => CatalogEntityRegistry.getInstance().getItemsForApiKind<KubernetesCluster>("entity.k8slens.dev/v1alpha1", "KubernetesCluster"), (entities) => {
      this.syncClustersFromCatalog(entities);
    });

    ipcMain.on("network:offline", this.onNetworkOffline);
    ipcMain.on("network:online", this.onNetworkOnline);
    ipcMain.handle(ClusterChannels.activate, this.handleClusterActivate);
    ipcMain.handle(ClusterChannels.setFrameId, this.handleClusteSetFrameId);
    ipcMain.handle(ClusterChannels.refresh, this.handleClusterRefresh);
    ipcMain.handle(ClusterChannels.disconnect, this.handleClusterDisconnect);
    ipcMain.handle(ClusterChannels.kubectlApplyAll, this.handleKubectlApplyAll);
  }

  /**
   * Is a computed mapping between `frameId`'s and their associated `ClusterFrameInfo`
   */
  @computed get frameMapById(): Map<number, number> {
    return new Map(iter.map(this.clusterFrameMap.values(), info => [info.frameId, info.processId]));
  }

  @action syncClustersFromCatalog(entities: KubernetesCluster[]) {
    for (const entity of entities) {
      const cluster = this.clusterInstances.get(entity.metadata.uid);

      if (!cluster) {
        this.clusterInstances.set(entity.metadata.uid, new Cluster({
          id: entity.metadata.uid,
          preferences: {
            clusterName: entity.metadata.name
          },
          kubeConfigPath: entity.spec.kubeconfigPath,
          contextName: entity.spec.kubeconfigContext
        }));

        // This is done so that the push to renderer is updated as necessary
        // This also should prevent extensions from trying to set this themselves
        // in the future.
        Object.defineProperty(entity, "status", {
          enumerable: true,
          configurable: false,
          writable: false,
          get(): KubernetesClusterStatus {
            return {
              phase: cluster.disconnected ? "disconnected" : "connected",
              active: !cluster.disconnected,
            };
          }
        });
      } else {
        cluster.kubeConfigPath = entity.spec.kubeconfigPath;
        cluster.contextName = entity.spec.kubeconfigContext;
      }
    }
  }

  protected onNetworkOffline = () => {
    logger.info("[CLUSTER-MANAGER]: network is offline");

    for (const cluster of this.clusterInstances.values()) {
      if (!cluster.disconnected) {
        cluster.online = false;
        cluster.accessible = false;
        cluster.refreshConnectionStatus().catch(noop);
      }
    }
  };

  protected onNetworkOnline = () => {
    logger.info("[CLUSTER-MANAGER]: network is online");

    for (const cluster of this.clusterInstances.values()) {
      if (!cluster.disconnected) {
        cluster.refreshConnectionStatus().catch(noop);
      }
    }
  };

  protected handleClusterActivate = (event: Electron.IpcMainInvokeEvent, clusterId: ClusterId, force = false) => {
    return this.clusterInstances.get(clusterId)?.activate(force);
  };

  protected handleClusteSetFrameId = ({ frameId, processId }: Electron.IpcMainInvokeEvent, clusterId: ClusterId) => {
    const cluster = this.clusterInstances.get(clusterId);

    if (!cluster) {
      return;
    }

    this.clusterFrameMap.set(cluster.id, { frameId, processId });

    return cluster.pushState();
  };

  protected handleClusterRefresh = (event: Electron.IpcMainInvokeEvent, clusterId: ClusterId) => {
    return this.clusterInstances.get(clusterId)?.refresh({ refreshMetadata: true });
  };

  protected handleClusterDisconnect = (event: Electron.IpcMainInvokeEvent, clusterId: ClusterId) => {
    return this.clusterInstances.get(clusterId)?.disconnect();
  };

  protected handleKubectlApplyAll = (event: Electron.IpcMainInvokeEvent, clusterId: ClusterId, resources: string[]) => {
    appEventBus.emit({ name: "cluster", action: "kubectl-apply-all" });

    const cluster = this.clusterInstances.get(clusterId);

    if (!cluster) {
      throw new Error(`${clusterId} is not a valid ID`);
    }

    return ResourceApplier.new(cluster).kubectlApplyAll(resources);
  };

  getFrameInfoByClusterId(clusterId: ClusterId): ClusterFrameInfo {
    return this.clusterFrameMap.get(clusterId);
  }

  getFrameProcessIdById(frameId: number): number {
    return this.frameMapById.get(frameId);
  }

  getAllFrameInfo(): ClusterFrameInfo[] {
    return Array.from(this.clusterFrameMap.values());
  }

  stop() {
    for (const cluster of this.clusterInstances.values()) {
      cluster.disconnect();
    }
  }

  getClusterForRequest(req: http.IncomingMessage): Cluster {
    let cluster: Cluster = null;

    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1];

      cluster = this.clusterInstances.get(clusterId);

      if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
        req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);
      }
    } else if (req.headers["x-cluster-id"]) {
      cluster = this.clusterInstances.get(req.headers["x-cluster-id"].toString());
    } else {
      const clusterId = getClusterIdFromHost(req.headers.host);

      cluster = this.clusterInstances.get(clusterId);
    }

    return cluster;
  }
}

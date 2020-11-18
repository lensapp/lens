import "../common/cluster-ipc";
import type http from "http"
import { ipcMain } from "electron"
import { autorun } from "mobx";
import { ClusterId, clusterStore, getClusterIdFromHost } from "../common/cluster-store"
import { Cluster } from "./cluster"
import { ManagedCluster } from "./managed-cluster"
import logger from "./logger";
import { apiKubePrefix } from "../common/vars";
import { Singleton } from "../common/utils";

export class ClusterManager extends Singleton {
  protected managedClusters: Map<ClusterId, ManagedCluster> = new Map()


  constructor(public readonly port: number) {
    super()
    // auto-init clusters
    autorun(() => {
      clusterStore.enabledClustersList.forEach(cluster => {
        if (!cluster.initialized) {
          logger.info(`[CLUSTER-MANAGER]: init cluster`, cluster.getMeta());
          const managedCluster = new ManagedCluster(cluster)
          managedCluster.init(port)
          this.managedClusters.set(cluster.id, managedCluster)
        }
      });
    });

    // auto-stop removed clusters
    autorun(() => {
      const removedClusters = Array.from(clusterStore.removedClusters.values());
      if (removedClusters.length > 0) {
        const meta = removedClusters.map(cluster => cluster.getMeta());
        logger.info(`[CLUSTER-MANAGER]: removing clusters`, meta);
        removedClusters.forEach((cluster) => {
          const managedCluster = this.managedClusters.get(cluster.id)
          if (managedCluster) {
            managedCluster.disconnect()
          }
        });
        clusterStore.removedClusters.clear();
      }
    }, {
      delay: 250
    });

    ipcMain.on("network:offline", () => { this.onNetworkOffline() })
    ipcMain.on("network:online", () => { this.onNetworkOnline() })
  }

  protected onNetworkOffline() {
    logger.info("[CLUSTER-MANAGER]: network is offline")
    clusterStore.enabledClustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        cluster.online = false
        cluster.accessible = false
        const managedCluster = this.managedClusters.get(cluster.id)
        if (managedCluster) {
          managedCluster.refreshConnectionStatus().catch((e) => e)
        }
      }
    })
  }

  protected onNetworkOnline() {
    logger.info("[CLUSTER-MANAGER]: network is online")
    clusterStore.enabledClustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        const managedCluster = this.managedClusters.get(cluster.id)
        if (managedCluster) {
          managedCluster.refreshConnectionStatus().catch((e) => e)
        }
      }
    })
  }

  stop() {
    clusterStore.clusters.forEach((cluster: Cluster) => {
      const managedCluster = this.managedClusters.get(cluster.id)
      if (managedCluster) {
        managedCluster.disconnect()
      }
    })
  }

  getClusterById(id: ClusterId) {
    return this.managedClusters.get(id)
  }

  getClusterForRequest(req: http.IncomingMessage): ManagedCluster {
    let cluster: ManagedCluster = null

    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1]
      cluster = this.managedClusters.get(clusterId)
      if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
        req.url = req.url.replace(`/${clusterId}`, apiKubePrefix)
      }
    } else if (req.headers["x-cluster-id"]) {
      cluster = this.managedClusters.get(req.headers["x-cluster-id"].toString())
    } else {
      const clusterId = getClusterIdFromHost(req.headers.host);
      cluster = this.managedClusters.get(clusterId)
    }

    return cluster;
  }
}

import type http from "http"
import { autorun } from "mobx";
import { ClusterId, clusterStore } from "../common/cluster-store"
import { Cluster } from "./cluster"
import { clusterIpc } from "../common/cluster-ipc";
import logger from "./logger";

export class ClusterManager {
  constructor(public readonly port: number) {
    // auto-init clusters
    autorun(() => {
      clusterStore.clusters.forEach(cluster => {
        if (!cluster.initialized) {
          logger.info(`[CLUSTER-MANAGER]: init cluster`, cluster.getMeta());
          cluster.init(port);
        }
      });
    });

    // auto-stop removed clusters
    autorun(() => {
      const removedClusters = Array.from(clusterStore.removedClusters.values());
      if (removedClusters.length > 0) {
        const meta = removedClusters.map(cluster => cluster.getMeta());
        logger.info(`[CLUSTER-MANAGER]: removing clusters`, meta);
        removedClusters.forEach(cluster => cluster.disconnect());
        clusterStore.removedClusters.clear();
      }
    }, {
      delay: 250
    });

    // listen for ipc-events that must/can be handled *only* in main-process (nodeIntegration=true)
    clusterIpc.activate.handleInMain();
    clusterIpc.disconnect.handleInMain();
    clusterIpc.installFeature.handleInMain();
    clusterIpc.uninstallFeature.handleInMain();
    clusterIpc.upgradeFeature.handleInMain();
  }

  stop() {
    clusterStore.clusters.forEach((cluster: Cluster) => {
      cluster.disconnect();
    })
  }

  protected getCluster(id: ClusterId) {
    return clusterStore.getById(id);
  }

  getClusterForRequest(req: http.IncomingMessage): Cluster {
    logger.info(`getClusterForRequest(): ${req.headers.host}${req.url}`)
    const clusterId = req.headers.host.split(".")[0]
    return this.getCluster(clusterId)
  }
}

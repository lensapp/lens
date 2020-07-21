import type http from "http"
import { autorun, reaction } from "mobx";
import { apiKubePrefix } from "../common/vars";
import { ClusterId, clusterStore } from "../common/cluster-store"
import { Cluster } from "./cluster"
import { clusterIpc } from "../common/cluster-ipc";
import logger from "./logger";

export class ClusterManager {
  protected activeClusterId: ClusterId;

  constructor(public readonly port: number) {
    this.activeClusterId = clusterStore.activeClusterId;

    // auto-init clusters
    autorun(() => {
      clusterStore.clusters.forEach(cluster => {
        if (!cluster.initialized) {
          logger.info(`[CLUSTER-MANAGER]: initializing cluster`, cluster.getMeta());
          cluster.init(port);
        }
      });
    });

    // auto-bind events for active cluster
    reaction(() => clusterStore.activeCluster, activeCluster => {
      const prevCluster = clusterStore.getById(this.activeClusterId);
      if (prevCluster) {
        prevCluster.unbindEvents();
      }
      if (activeCluster) {
        this.activeClusterId = activeCluster.id;
        activeCluster.bindEvents();
        activeCluster.refreshStatus();
        activeCluster.pushState();
      }
    }, {
      fireImmediately: true
    });

    // auto-stop removed clusters
    autorun(() => {
      const { removedClusters } = clusterStore;
      if (removedClusters.size > 0) {
        const meta = Array.from(removedClusters.values()).map(cluster => cluster.getMeta());
        logger.info(`[CLUSTER-MANAGER]: removing clusters`, meta);
        removedClusters.forEach(cluster => cluster.disconnect());
        removedClusters.clear();
      }
    }, {
      delay: 250
    });

    // listen for ipc-events that must/can be handled *only* in main-process (nodeIntegration=true)
    clusterIpc.refresh.handleInMain();
    clusterIpc.disconnect.handleInMain();
    clusterIpc.reconnect.handleInMain();
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
    let cluster: Cluster = null

    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1]
      if (clusterId) {
        cluster = this.getCluster(clusterId)
        if (cluster) {
          // we need to swap path prefix so that request is proxied to kube api
          req.url = req.url.replace(`/${clusterId}`, apiKubePrefix)
        }
      }
    } else {
      const id = req.headers.host.split(".")[0]
      cluster = this.getCluster(id)
    }

    return cluster;
  }
}

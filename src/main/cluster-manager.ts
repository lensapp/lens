import type http from "http"
import { autorun } from "mobx";
import { apiKubePrefix } from "../common/vars";
import { ClusterId, clusterStore } from "../common/cluster-store"
import { handleMessage } from "../common/ipc";
import { tracker } from "../common/tracker";
import { Cluster, ClusterIpcEvent } from "./cluster"
import logger from "./logger";

export class ClusterManager {
  constructor(public readonly port: number) {
    // auto-init clusters
    autorun(() => {
      clusterStore.clusters.forEach(cluster => {
        if (cluster.initialized) return;
        cluster.init(port);
        logger.info(`[CLUSTER-MANAGER]: initializing cluster`, cluster.getMeta());
      });
    });

    // auto-stop removed clusters
    autorun(() => {
      const { removedClusters } = clusterStore;
      const meta = Array.from(removedClusters.values()).map(cluster => cluster.getMeta());
      logger.info(`[CLUSTER-MANAGER]: removing clusters`, meta);
      removedClusters.forEach(cluster => cluster.destroy());
      removedClusters.clear();
    }, {
      delay: 250
    });

    // listen for ipc-events that must be handled *only* in main-process (nodeIntegration=true)
    handleMessage(ClusterIpcEvent.STOP, this.stopCluster.bind(this));
  }

  stop() {
    clusterStore.clusters.forEach((cluster: Cluster) => {
      cluster.stop();
    })
  }

  protected getCluster(id: ClusterId) {
    return clusterStore.getById(id);
  }

  protected stopCluster(clusterId: ClusterId) {
    tracker.event("cluster", "stop");
    this.getCluster(clusterId)?.destroy();
  }

  // todo
  protected reconnectCluster(clusterId: ClusterId) {
    tracker.event("cluster", "reconnect");
    logger.info(`[CLUSTER-MANAGER]: reconnect cluster`, {
      meta: this.getCluster(clusterId)?.getMeta()
    });
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

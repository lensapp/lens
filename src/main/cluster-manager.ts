import "../common/cluster-ipc";
import type http from "http"
import { autorun } from "mobx";
import { clusterStore, getClusterIdFromHost } from "../common/cluster-store"
import { Cluster } from "./cluster"
import logger from "./logger";
import { apiKubePrefix } from "../common/vars";

export class ClusterManager {
  constructor(public readonly port: number) {
    // auto-init clusters
    autorun(() => {
      clusterStore.enabledClustersList.forEach(cluster => {
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
  }

  stop() {
    clusterStore.clusters.forEach((cluster: Cluster) => {
      cluster.disconnect();
    })
  }

  getClusterForRequest(req: http.IncomingMessage): Cluster {
    let cluster: Cluster = null

    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1]
      cluster = clusterStore.getById(clusterId)
      if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
        req.url = req.url.replace(`/${clusterId}`, apiKubePrefix)
      }
    } else if (req.headers["x-cluster-id"]) {
      cluster = clusterStore.getById(req.headers["x-cluster-id"].toString())
    } else {
      const clusterId = getClusterIdFromHost(req.headers.host);
      cluster = clusterStore.getById(clusterId)
    }

    return cluster;
  }
}

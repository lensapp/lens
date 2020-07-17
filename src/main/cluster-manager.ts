import type http from "http"
import { autorun } from "mobx";
import { apiKubePrefix } from "../common/vars";
import { ClusterId, clusterStore } from "../common/cluster-store"
import { handleMessage } from "../common/ipc";
import { tracker } from "../common/tracker";
import { Cluster, ClusterIpcEvent } from "./cluster"

export class ClusterManager {
  constructor(public readonly port: number) {
    // auto-init clusters
    autorun(() => {
      clusterStore.clustersList
        .filter(cluster => !cluster.initialized)
        .forEach(cluster => cluster.init(port));
    });

    // auto-stop removed clusters
    autorun(() => {
      clusterStore.removedClusters.forEach(cluster => cluster.stop());
      clusterStore.removedClusters.clear();
    });

    // listen ipc-events which could be handled *only* in main-process (nodeIntegration=true)
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
    this.getCluster(clusterId)?.stop();
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

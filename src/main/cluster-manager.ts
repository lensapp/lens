import "../common/cluster-ipc";
import type http from "http";
import { ipcMain } from "electron";
import { action, reaction, toJS } from "mobx";
import { ClusterStore, getClusterIdFromHost } from "../common/cluster-store";
import { Cluster } from "./cluster";
import logger from "./logger";
import { apiKubePrefix } from "../common/vars";
import { Singleton } from "../common/utils";
import { catalogEntityRegistry } from "../common/catalog";
import { KubernetesCluster } from "../common/catalog-entities/kubernetes-cluster";

export class ClusterManager extends Singleton {
  constructor() {
    super();

    reaction(() => toJS(ClusterStore.getInstance().clustersList, { recurseEverything: true }), () => {
      this.updateCatalog(ClusterStore.getInstance().clustersList);
    }, { fireImmediately: true });

    reaction(() => catalogEntityRegistry.getItemsForApiKind<KubernetesCluster>("entity.k8slens.dev/v1alpha1", "KubernetesCluster"), (entities) => {
      this.syncClustersFromCatalog(entities);
    });

    ipcMain.on("network:offline", () => { this.onNetworkOffline(); });
    ipcMain.on("network:online", () => { this.onNetworkOnline(); });
  }

  @action protected updateCatalog(clusters: Cluster[]) {
    for (const cluster of clusters) {
      const index = catalogEntityRegistry.items.findIndex((entity) => entity.metadata.uid === cluster.id);

      if (index !== -1) {
        const entity = catalogEntityRegistry.items[index];

        entity.status.phase = cluster.disconnected ? "disconnected" : "connected";
        entity.status.active = !cluster.disconnected;

        if (cluster.preferences?.clusterName) {
          entity.metadata.name = cluster.preferences.clusterName;
        }
        catalogEntityRegistry.items.splice(index, 1, entity);
      }
    }
  }

  @action syncClustersFromCatalog(entities: KubernetesCluster[]) {
    for (const entity of entities) {
      const cluster = ClusterStore.getInstance().getById(entity.metadata.uid);

      if (!cluster) {
        ClusterStore.getInstance().addCluster({
          id: entity.metadata.uid,
          preferences: {
            clusterName: entity.metadata.name
          },
          kubeConfigPath: entity.spec.kubeconfigPath,
          contextName: entity.spec.kubeconfigContext
        });
      } else {
        cluster.kubeConfigPath = entity.spec.kubeconfigPath;
        cluster.contextName = entity.spec.kubeconfigContext;

        entity.status = {
          phase: cluster.disconnected ? "disconnected" : "connected",
          active: !cluster.disconnected
        };
      }
    }
  }

  protected onNetworkOffline() {
    logger.info("[CLUSTER-MANAGER]: network is offline");
    ClusterStore.getInstance().clustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        cluster.online = false;
        cluster.accessible = false;
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    });
  }

  protected onNetworkOnline() {
    logger.info("[CLUSTER-MANAGER]: network is online");
    ClusterStore.getInstance().clustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    });
  }

  stop() {
    ClusterStore.getInstance().clusters.forEach((cluster: Cluster) => {
      cluster.disconnect();
    });
  }

  getClusterForRequest(req: http.IncomingMessage): Cluster {
    let cluster: Cluster = null;

    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1];

      cluster = ClusterStore.getInstance().getById(clusterId);

      if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
        req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);
      }
    } else if (req.headers["x-cluster-id"]) {
      cluster = ClusterStore.getInstance().getById(req.headers["x-cluster-id"].toString());
    } else {
      const clusterId = getClusterIdFromHost(req.headers.host);

      cluster = ClusterStore.getInstance().getById(clusterId);
    }

    return cluster;
  }
}

export function catalogEntityFromCluster(cluster: Cluster) {
  return new KubernetesCluster(toJS({
    apiVersion: "entity.k8slens.dev/v1alpha1",
    kind: "KubernetesCluster",
    metadata: {
      uid: cluster.id,
      name: cluster.name,
      source: "local",
      labels: {
        distro: cluster.distribution,
      }
    },
    spec: {
      kubeconfigPath: cluster.kubeConfigPath,
      kubeconfigContext: cluster.contextName
    },
    status: {
      phase: cluster.disconnected ? "disconnected" : "connected",
      reason: "",
      message: "",
      active: !cluster.disconnected
    }
  }));
}

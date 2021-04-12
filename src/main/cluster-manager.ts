import "../common/cluster-ipc";
import type http from "http";
import { ipcMain } from "electron";
import { action, autorun, observable, reaction, toJS } from "mobx";
import { clusterStore, getClusterIdFromHost } from "../common/cluster-store";
import { Cluster } from "./cluster";
import logger from "./logger";
import { apiKubePrefix } from "../common/vars";
import { Singleton } from "../common/utils";
import { CatalogEntity } from "../common/catalog-entity";
import { KubernetesCluster } from "../common/catalog-entities/kubernetes-cluster";
import { catalogEntityRegistry } from "../common/catalog-entity-registry";

const clusterOwnerRef = "ClusterManager";

export class ClusterManager extends Singleton {
  catalogSource = observable.array<CatalogEntity>([]);

  constructor(public readonly port: number) {
    super();

    catalogEntityRegistry.addSource("lens:kubernetes-clusters", this.catalogSource);
    // auto-init clusters
    reaction(() => clusterStore.enabledClustersList, (clusters) => {
      clusters.forEach((cluster) => {
        if (!cluster.initialized && !cluster.initializing) {
          logger.info(`[CLUSTER-MANAGER]: init cluster`, cluster.getMeta());
          cluster.init(port);
        }
      });

    }, { fireImmediately: true });

    reaction(() => toJS(clusterStore.enabledClustersList, { recurseEverything: true }), () => {
      this.updateCatalogSource(clusterStore.enabledClustersList);
    }, { fireImmediately: true });

    reaction(() => catalogEntityRegistry.getItemsForApiKind<KubernetesCluster>("entity.k8slens.dev/v1alpha1", "KubernetesCluster"), (entities) => {
      this.syncClustersFromCatalog(entities);
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

    ipcMain.on("network:offline", () => { this.onNetworkOffline(); });
    ipcMain.on("network:online", () => { this.onNetworkOnline(); });
  }

  @action protected updateCatalogSource(clusters: Cluster[]) {
    this.catalogSource.forEach((entity, index) => {
      const clusterIndex = clusters.findIndex((cluster) => entity.metadata.uid === cluster.id);

      if (clusterIndex === -1) {
        this.catalogSource.splice(index, 1);
      }
    });

    clusters.filter((c) => !c.ownerRef).forEach((cluster) => {
      const entityIndex = this.catalogSource.findIndex((entity) => entity.metadata.uid === cluster.id);
      const newEntity = this.catalogEntityFromCluster(cluster);

      if (entityIndex === -1) {
        this.catalogSource.push(newEntity);
      } else {
        const oldEntity = this.catalogSource[entityIndex];

        newEntity.status.phase = cluster.disconnected ? "disconnected" : "connected";
        newEntity.status.active = !cluster.disconnected;
        newEntity.metadata.labels = {
          ...newEntity.metadata.labels,
          ...oldEntity.metadata.labels
        };
        this.catalogSource.splice(entityIndex, 1, newEntity);
      }
    });
  }

  @action syncClustersFromCatalog(entities: KubernetesCluster[]) {
    entities.filter((entity) => entity.metadata.source !== "local").forEach((entity: KubernetesCluster) => {
      const cluster = clusterStore.getById(entity.metadata.uid);

      if (!cluster) {
        clusterStore.addCluster({
          id: entity.metadata.uid,
          enabled: true,
          ownerRef: clusterOwnerRef,
          preferences: {
            clusterName: entity.metadata.name
          },
          kubeConfigPath: entity.spec.kubeconfigPath,
          contextName: entity.spec.kubeconfigContext
        });
      } else {
        cluster.enabled = true;
        if (!cluster.ownerRef) cluster.ownerRef = clusterOwnerRef;
        cluster.preferences.clusterName = entity.metadata.name;
        cluster.kubeConfigPath = entity.spec.kubeconfigPath;
        cluster.contextName = entity.spec.kubeconfigContext;

        entity.status = {
          phase: cluster.disconnected ? "disconnected" : "connected",
          active: !cluster.disconnected
        };
      }
    });
  }

  protected catalogEntityFromCluster(cluster: Cluster) {
    return new KubernetesCluster(toJS({
      apiVersion: "entity.k8slens.dev/v1alpha1",
      kind: "KubernetesCluster",
      metadata: {
        uid: cluster.id,
        name: cluster.name,
        source: "local",
        labels: {
          "distro": (cluster.metadata["distribution"] || "unknown").toString()
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

  protected onNetworkOffline() {
    logger.info("[CLUSTER-MANAGER]: network is offline");
    clusterStore.enabledClustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        cluster.online = false;
        cluster.accessible = false;
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    });
  }

  protected onNetworkOnline() {
    logger.info("[CLUSTER-MANAGER]: network is online");
    clusterStore.enabledClustersList.forEach((cluster) => {
      if (!cluster.disconnected) {
        cluster.refreshConnectionStatus().catch((e) => e);
      }
    });
  }

  stop() {
    clusterStore.clusters.forEach((cluster: Cluster) => {
      cluster.disconnect();
    });
  }

  getClusterForRequest(req: http.IncomingMessage): Cluster {
    let cluster: Cluster = null;

    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1];

      cluster = clusterStore.getById(clusterId);

      if (cluster) {
        // we need to swap path prefix so that request is proxied to kube api
        req.url = req.url.replace(`/${clusterId}`, apiKubePrefix);
      }
    } else if (req.headers["x-cluster-id"]) {
      cluster = clusterStore.getById(req.headers["x-cluster-id"].toString());
    } else {
      const clusterId = getClusterIdFromHost(req.headers.host);

      cluster = clusterStore.getById(clusterId);
    }

    return cluster;
  }
}

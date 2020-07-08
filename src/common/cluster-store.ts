import { action, observable, toJS } from "mobx";
import { v4 as uuid } from "uuid"
import { BaseStore } from "./base-store";
import { Cluster } from "../main/cluster";
import migrations from "../migrations/cluster-store"

export interface ClusterStoreModel {
  activeCluster?: ClusterId; // last opened cluster
  clusters?: ClusterModel[]
}

export type ClusterId = string;

export interface ClusterModel {
  id: ClusterId;
  contextName: string;
  kubeConfigPath: string;
  port?: number;
  kubeConfig?: string;
  workspace?: string;
  preferences?: ClusterPreferences;
}

export interface ClusterPreferences {
  terminalCWD?: string;
  clusterName?: string;
  prometheus?: {
    namespace: string;
    service: string;
    port: number;
    prefix: string;
  };
  prometheusProvider?: {
    type: string;
  };
  icon?: string;
  httpsProxy?: string;
}

export class ClusterStore extends BaseStore<ClusterStoreModel> {
  @observable activeCluster: ClusterId;
  @observable clusters = observable.map<ClusterId, Cluster>();
  @observable removedClusters = observable.map<ClusterId, Cluster>();

  private constructor() {
    super({
      configName: "lens-cluster-store",
      confOptions: {
        migrations: migrations,
        accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      }
    });
  }

  getById(id: ClusterId): Cluster {
    return this.clusters.get(id);
  }

  getByWorkspaceId(workspaceId: string): Cluster[] {
    return Array.from(this.clusters.values()).filter(cluster => {
      return cluster.workspace === workspaceId;
    })
  }

  @action
  addCluster(model: ClusterModel): Cluster {
    const id = model.id || uuid();
    const cluster = new Cluster({ ...model, id })
    this.clusters.set(id, cluster);
    return cluster;
  }

  @action
  removeById(clusterId: ClusterId): void {
    if (this.activeCluster === clusterId) {
      this.activeCluster = null;
    }
    this.clusters.delete(clusterId);
  }

  @action
  removeByWorkspaceId(workspaceId: string) {
    this.getByWorkspaceId(workspaceId).forEach(cluster => {
      this.removeById(cluster.id)
    })
  }

  @action
  protected fromStore({ activeCluster, clusters = [] }: ClusterStoreModel = {}) {
    const currentClusters = this.clusters.toJS();
    const newClusters = new Map<ClusterId, Cluster>();
    const removedClusters = new Map<ClusterId, Cluster>();

    // update new clusters
    clusters.forEach(clusterModel => {
      let cluster = currentClusters.get(clusterModel.id);
      if (cluster) {
        Object.assign(cluster, clusterModel);
        cluster.mergeModel(clusterModel);
      } else {
        cluster = new Cluster(clusterModel);
      }
      newClusters.set(clusterModel.id, cluster);
    });

    // update removed clusters
    currentClusters.forEach(cluster => {
      if (!newClusters.has(cluster.id)) {
        removedClusters.set(cluster.id, cluster);
      }
    });

    this.activeCluster = newClusters.has(activeCluster) ? activeCluster : null;
    this.clusters.replace(newClusters);
    this.removedClusters.replace(removedClusters);
  }

  toJSON(): ClusterStoreModel {
    const clusters = Array.from(this.clusters).map(([id, cluster]) => cluster.toJSON());
    return toJS({
      activeCluster: this.activeCluster,
      clusters: clusters,
    }, {
      recurseEverything: true
    })
  }
}

export const clusterStore: ClusterStore = ClusterStore.getInstance();

import { action, computed, toJS } from "mobx";
import migrations from "../migrations/cluster-store"
import { BaseStore } from "./base-store";
import { Cluster } from "../main/cluster";

export interface ClusterStoreModel {
  clusters: ClusterModel[]
}

export type ClusterId = string;

export interface ClusterModel {
  id: ClusterId;
  contextName: string;
  kubeConfigPath: string;
  kubeConfig?: string;
  port?: number;
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
  private constructor() {
    super({
      configName: "lens-cluster-store",
      confOptions: {
        migrations: migrations,
        accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      }
    });
  }

  // setup initial value
  protected data: ClusterStoreModel = {
    clusters: [],
  }

  @computed get clusters(): Cluster[] {
    return toJS(this.data.clusters).map(model => new Cluster(model));
  }

  getById(clusterId: ClusterId): Cluster {
    return this.clusters.find(cluster => cluster.id === clusterId)
  }

  getIndexById(clusterId: ClusterId): number {
    return this.clusters.findIndex(cluster => cluster.id === clusterId)
  }

  @action
  removeById(clusterId: ClusterId): void {
    const index = this.getIndexById(clusterId);
    if (index > -1) {
      this.data.clusters.splice(index, 1);
    }
  }

  @action
  removeAllByWorkspaceId(workspaceId: string) {
    this.clusters.forEach(cluster => {
      if (cluster.workspace === workspaceId) {
        this.removeById(cluster.id)
      }
    })
  }
}

export const clusterStore: ClusterStore = ClusterStore.getInstance();

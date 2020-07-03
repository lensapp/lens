import ElectronStore from "electron-store"
import { Singleton } from "./utils/singleton";
import migrations from "../migrations/cluster-store"
import { Cluster, ClusterBaseInfo } from "../main/cluster";

export class ClusterStore extends Singleton {
  private store = new ElectronStore({
    name: "lens-cluster-store",
    accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
    migrations: migrations,
  })

  public getAllClusterObjects(): Cluster[] {
    return this.store.get("clusters", []).map((clusterInfo: ClusterBaseInfo) => {
      return new Cluster(clusterInfo)
    })
  }

  public getAllClusters(): Array<ClusterBaseInfo> {
    return this.store.get("clusters", [])
  }

  public removeCluster(id: string): void {
    this.store.delete(id);
    const clusterBaseInfos = this.getAllClusters()
    const index = clusterBaseInfos.findIndex((cbi) => cbi.id === id)
    if (index !== -1) {
      clusterBaseInfos.splice(index, 1)
      this.store.set("clusters", clusterBaseInfos)
    }
  }

  public removeClustersByWorkspace(workspace: string) {
    this.getAllClusters().forEach((cluster) => {
      if (cluster.workspace === workspace) {
        this.removeCluster(cluster.id)
      }
    })
  }

  public getCluster(id: string): Cluster {
    const cluster = this.getAllClusterObjects().find((cluster) => cluster.id === id)
    if (cluster) {
      return cluster
    }

    return null
  }

  public saveCluster(cluster: ClusterBaseInfo) {
    const clusters = this.getAllClusters();
    const index = clusters.findIndex((cl) => cl.id === cluster.id)
    const storable = {
      id: cluster.id,
      kubeConfig: cluster.kubeConfig,
      preferences: cluster.preferences,
      workspace: cluster.workspace
    }
    if (index === -1) {
      clusters.push(storable)
    } else {
      clusters[index] = storable
    }
    this.store.set("clusters", clusters)
  }

  public storeClusters(clusters: ClusterBaseInfo[]) {
    clusters.forEach((cluster: ClusterBaseInfo) => {
      this.removeCluster(cluster.id)
      this.saveCluster(cluster)
    })
  }

  public reloadCluster(cluster: ClusterBaseInfo): void {
    const storedCluster = this.getCluster(cluster.id);
    if (storedCluster) {
      cluster.kubeConfig = storedCluster.kubeConfig
      cluster.preferences = storedCluster.preferences
      cluster.workspace = storedCluster.workspace
    }
  }
}

export const clusterStore: ClusterStore = ClusterStore.getInstance();

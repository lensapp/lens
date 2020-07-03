import { KubeConfig } from "@kubernetes/client-node"
import { PromiseIpc } from "electron-promise-ipc"
import http from "http"
import { Cluster, ClusterBaseInfo } from "./cluster"
import { clusterStore } from "../common/cluster-store"
import * as k8s from "./k8s"
import logger from "./logger"
import { LensProxy } from "./proxy"
import { app } from "electron"
import path from "path"
import { promises } from "fs"
import  { ensureDir } from "fs-extra"
import filenamify from "filenamify"
import { v4 as uuid } from "uuid"
import { apiPrefix } from "../common/vars";

export type FeatureInstallRequest = {
  name: string;
  clusterId: string;
  config: any;
}

export type FeatureInstallResponse = {
  success: boolean;
  message: string;
}

export type ClusterIconUpload = {
  path: string;
  name: string;
  clusterId: string;
}

export class ClusterManager {
  public static readonly clusterIconDir = path.join(app.getPath("userData"), "icons")
  protected promiseIpc: any
  protected proxyServer: LensProxy
  protected port: number
  protected clusters: Map<string, Cluster>;

  constructor(clusters: Cluster[], port: number) {
    this.promiseIpc = new PromiseIpc({ timeout: 2000 })
    this.port = port
    this.clusters = new Map()
    clusters.forEach((clusterInfo) => {
      try {
        const kc = this.loadKubeConfig(clusterInfo.kubeConfigPath)
        const cluster = new Cluster({
          id: clusterInfo.id,
          port: this.port,
          kubeConfigPath: clusterInfo.kubeConfigPath,
          contextName: clusterInfo.contextName,
          preferences: clusterInfo.preferences,
          workspace: clusterInfo.workspace
        })
        cluster.init(kc)
        logger.debug(`Created cluster[id: ${ cluster.id }] for context ${ cluster.contextName }`)
        this.clusters.set(cluster.id, cluster)
      } catch(error) {
        logger.error(`Error while initializing ${clusterInfo.contextName}`)
      }
    });
    logger.debug("clusters after constructor:" + this.clusters.size)
    this.listenEvents()
  }

  public getClusters() {
    return this.clusters.values()
  }

  public getCluster(id: string) {
    return this.clusters.get(id)
  }

  public stop() {
    const clusters = Array.from(this.getClusters())
    clusters.map(cluster => cluster.stopServer())
  }

  protected loadKubeConfig(configPath: string): KubeConfig {
    const kc = new KubeConfig();
    kc.loadFromFile(configPath)
    return kc;
  }

  protected async addNewCluster(clusterData: ClusterBaseInfo): Promise<Cluster> {
    return new Promise(async (resolve, reject) => {
      try {
        const kc = this.loadKubeConfig(clusterData.kubeConfigPath)
        k8s.validateConfig(kc)
        kc.setCurrentContext(clusterData.contextName)
        const cluster = new Cluster({
          id: uuid(),
          port: this.port,
          kubeConfigPath: clusterData.kubeConfigPath,
          contextName: clusterData.contextName,
          preferences: clusterData.preferences,
          workspace: clusterData.workspace
        })
        cluster.init(kc)
        cluster.save()
        this.clusters.set(cluster.id, cluster)
        resolve(cluster)

      } catch(error) {
        logger.error(error)
        reject(error)
      }
    });
  }

  protected listenEvents() {
    this.promiseIpc.on("addCluster", async (clusterData: ClusterBaseInfo) => {
      logger.debug(`IPC: addCluster`)
      const cluster = await this.addNewCluster(clusterData)
      return {
        addedCluster: cluster.toClusterInfo(),
        allClusters: Array.from(this.getClusters()).map((cluster: Cluster) => cluster.toClusterInfo())
      }
    });

    this.promiseIpc.on("getClusters", async (workspaceId: string) => {
      logger.debug(`IPC: getClusters, workspace ${workspaceId}`)
      const workspaceClusters = Array.from(this.getClusters()).filter((cluster) => cluster.workspace === workspaceId)
      return workspaceClusters.map((cluster: Cluster) => cluster.toClusterInfo())
    });

    this.promiseIpc.on("getCluster", async (id: string) => {
      logger.debug(`IPC: getCluster`)
      const cluster = this.getCluster(id)
      if (cluster) {
        await cluster.refreshCluster()
        return cluster.toClusterInfo()
      } else {
        return null
      }
    });

    this.promiseIpc.on("installFeature", async (installReq: FeatureInstallRequest) => {
      logger.debug(`IPC: installFeature for ${installReq.name}`)
      const cluster = this.clusters.get(installReq.clusterId)
      try {
        await cluster.installFeature(installReq.name, installReq.config)
        return {success: true, message: ""}
      } catch(error) {
        return {success: false, message: error}
      }
    });

    this.promiseIpc.on("upgradeFeature", async (installReq: FeatureInstallRequest) => {
      logger.debug(`IPC: upgradeFeature for ${installReq.name}`)
      const cluster = this.clusters.get(installReq.clusterId)
      try {
        await cluster.upgradeFeature(installReq.name, installReq.config)
        return {success: true, message: ""}
      } catch(error) {
        return {success: false, message: error}
      }
    });

    this.promiseIpc.on("uninstallFeature", async (installReq: FeatureInstallRequest) => {
      logger.debug(`IPC: uninstallFeature for ${installReq.name}`)
      const cluster = this.clusters.get(installReq.clusterId)

      await cluster.uninstallFeature(installReq.name)
      return {success: true, message: ""}
    });

    this.promiseIpc.on("saveClusterIcon", async (fileUpload: ClusterIconUpload) => {
      logger.debug(`IPC: saveClusterIcon for ${fileUpload.clusterId}`)
      const cluster = this.getCluster(fileUpload.clusterId)
      if (!cluster) {
        return {success: false, message: "Cluster not found"}
      }
      try {
        const clusterIcon = await this.uploadClusterIcon(cluster, fileUpload.name, fileUpload.path)
        clusterStore.reloadCluster(cluster);
        if(!cluster.preferences) cluster.preferences = {};
        cluster.preferences.icon = clusterIcon
        clusterStore.storeCluster(cluster);
        return {success: true, cluster: cluster.toClusterInfo(), message: ""}
      } catch(error) {
        return {success: false, message: error}
      }
    });

    this.promiseIpc.on("resetClusterIcon", async (id: string) => {
      logger.debug(`IPC: resetClusterIcon`)
      const cluster = this.getCluster(id)
      if (cluster && cluster.preferences) {
        cluster.preferences.icon = null;
        clusterStore.storeCluster(cluster)
        return {success: true, cluster: cluster.toClusterInfo(), message: ""}
      } else {
        return {success: false, message: "Cluster not found"}
      }
    });

    this.promiseIpc.on("refreshCluster", async (clusterId: string) => {
      const cluster = this.clusters.get(clusterId)
      await cluster.refreshCluster()
      return cluster.toClusterInfo()
    });

    this.promiseIpc.on("stopCluster", (clusterId: string) => {
      logger.debug(`IPC: stopCluster: ${clusterId}`)
      const cluster = this.clusters.get(clusterId)
      if (cluster) {
        cluster.stopServer()
        return true
      }
      return false
    });

    this.promiseIpc.on("removeCluster", (ctx: string) => {
      logger.debug(`IPC: removeCluster: ${ctx}`)
      return this.removeCluster(ctx).map((cluster: Cluster) => cluster.toClusterInfo())
    });

    this.promiseIpc.on("clusterStored", (clusterId: string) => {
      logger.debug(`IPC: clusterStored: ${clusterId}`)
      const cluster = this.clusters.get(clusterId)
      if (cluster) {
        clusterStore.reloadCluster(cluster);
        cluster.stopServer()
      }
    });

    this.promiseIpc.on("preferencesSaved", () => {
      logger.debug(`IPC: preferencesSaved`)
      this.clusters.forEach((cluster) => {
        cluster.stopServer()
      })
    });

    this.promiseIpc.on("getClusterEvents", async (clusterId: string) => {
      const cluster = this.clusters.get(clusterId)
      return cluster.getEventCount();
    });

  }

  public removeCluster(id: string): Cluster[] {
    const cluster = this.clusters.get(id)
    if (cluster) {
      cluster.stopServer()
      clusterStore.removeCluster(cluster.id);
      this.clusters.delete(cluster.id)
    }
    return Array.from(this.clusters.values())
  }

  public getClusterForRequest(req: http.IncomingMessage): Cluster {
    let cluster: Cluster = null

    // lens-server is connecting to 127.0.0.1:<port>/<uid>
    if (req.headers.host.startsWith("127.0.0.1")) {
      const clusterId = req.url.split("/")[1]
      if (clusterId) {
        cluster = this.clusters.get(clusterId)
        if (cluster) {
          // we need to swap path prefix so that request is proxied to kube api
          req.url = req.url.replace(`/${clusterId}`, apiPrefix.KUBE_BASE)
        }
      }
    } else {
      const id = req.headers.host.split(".")[0]
      cluster = this.clusters.get(id)
    }

    return cluster;
  }

  protected async uploadClusterIcon(cluster: Cluster, fileName: string, src: string): Promise<string> {
    await ensureDir(ClusterManager.clusterIconDir)
    fileName = filenamify(cluster.contextName + "-" + fileName)
    const dest = path.join(ClusterManager.clusterIconDir, fileName)
    await promises.copyFile(src, dest)
    return "store:///icons/" + fileName
  }
}

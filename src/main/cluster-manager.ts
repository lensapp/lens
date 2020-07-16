import { app } from "electron"
import { autorun } from "mobx";
import path from "path"
import http from "http"
import { copyFile, ensureDir } from "fs-extra"
import filenamify from "filenamify"
import { apiKubePrefix, appProto } from "../common/vars";
import { ClusterId, ClusterModel, clusterStore } from "../common/cluster-store"
import { handleMessages } from "../common/ipc";
import { ClusterIpcMessage } from "../common/ipc-messages";
import { tracker } from "../common/tracker";
import { validateConfig } from "./k8s";
import { Cluster } from "./cluster"
import { FeatureInstallRequest } from "./feature";
import logger from "./logger"

export interface ClusterIconUpload {
  clusterId: string;
  name: string;
  path: string;
}

export class ClusterManager {
  static get clusterIconDir() {
    return path.join(app.getPath("userData"), "icons");
  }

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
    // listen ipc-events
    ClusterManager.ipcListen(this);
  }

  stop() {
    clusterStore.clusters.forEach((cluster: Cluster) => {
      cluster.stop();
    })
  }

  protected getCluster(id: ClusterId) {
    return clusterStore.getById(id);
  }

  protected async addCluster(clusterModel: ClusterModel): Promise<Cluster> {
    tracker.event("cluster", "add");
    try {
      await validateConfig(clusterModel.kubeConfigPath);
      return clusterStore.addCluster(clusterModel);
    } catch (error) {
      logger.error(`[CLUSTER-MANAGER]: add cluster error ${JSON.stringify(error)}`)
      throw error;
    }
  }

  protected stopCluster(clusterId: ClusterId) {
    tracker.event("cluster", "stop");
    this.getCluster(clusterId)?.stop();
  }

  protected removeAllByWorkspace(workspaceId: string) {
    tracker.event("cluster", "remove-workspace");
    const clusters = clusterStore.getByWorkspaceId(workspaceId);
    clusters.forEach(cluster => {
      this.removeCluster(cluster.id);
    });
  }

  protected removeCluster(clusterId: string): Cluster {
    tracker.event("cluster", "remove");
    const cluster = this.getCluster(clusterId);
    if (cluster) {
      cluster.stop()
      clusterStore.removeById(cluster.id);
      return cluster;
    }
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

  protected async uploadClusterIcon({ clusterId, name: fileName, path: src }: ClusterIconUpload): Promise<string> {
    const cluster = this.getCluster(clusterId);
    if (cluster) {
      tracker.event("cluster", "upload-icon");
      await ensureDir(ClusterManager.clusterIconDir)
      fileName = filenamify(cluster.contextName + "-" + fileName)
      const dest = path.join(ClusterManager.clusterIconDir, fileName)
      await copyFile(src, dest)
      cluster.preferences.icon = `${appProto}:///icons/${fileName}`
      return cluster.preferences.icon;
    }
  }

  // todo: remove current icon file ?
  protected resetClusterIcon(clusterId: ClusterId) {
    const cluster = this.getCluster(clusterId);
    if (cluster) {
      tracker.event("cluster", "reset-icon")
      cluster.preferences.icon = null;
    }
  }

  protected async installFeature({ clusterId, name, config }: FeatureInstallRequest) {
    tracker.event("cluster", "install-feature")
    return this.getCluster(clusterId)?.installFeature(name, config)
  }

  protected async upgradeFeature({ clusterId, name, config }: FeatureInstallRequest) {
    tracker.event("cluster", "upgrade-feature")
    return this.getCluster(clusterId)?.upgradeFeature(name, config)
  }

  protected async uninstallFeature({ clusterId, name }: FeatureInstallRequest) {
    tracker.event("cluster", "uninstall-feature")
    return this.getCluster(clusterId)?.uninstallFeature(name);
  }

  static ipcListen(clusterManager: ClusterManager) {
    const handlers = {
      [ClusterIpcMessage.ADD]: clusterManager.addCluster,
      [ClusterIpcMessage.STOP]: clusterManager.stopCluster,
      [ClusterIpcMessage.REMOVE]: clusterManager.removeCluster,
      [ClusterIpcMessage.REMOVE_WORKSPACE]: clusterManager.removeAllByWorkspace,
      [ClusterIpcMessage.FEATURE_INSTALL]: clusterManager.installFeature,
      [ClusterIpcMessage.FEATURE_UPGRADE]: clusterManager.upgradeFeature,
      [ClusterIpcMessage.FEATURE_REMOVE]: clusterManager.uninstallFeature,
      [ClusterIpcMessage.ICON_SAVE]: clusterManager.uploadClusterIcon,
      [ClusterIpcMessage.ICON_RESET]: clusterManager.removeCluster,
    };
    Object.entries(handlers).forEach(([key, handler]) => {
      handlers[key as keyof typeof handlers] = handler.bind(clusterManager);
    })
    handleMessages(handlers, {
      timeout: 2000
    })
  }
}

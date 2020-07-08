import { autorun } from "mobx";
import { apiPrefix, appProto } from "../common/vars";
import { app } from "electron"
import path from "path"
import http from "http"
import { copyFile, ensureDir } from "fs-extra"
import filenamify from "filenamify"
import { validateConfig } from "./k8s";
import { Cluster } from "./cluster"
import { ClusterId, ClusterModel, clusterStore } from "../common/cluster-store"
import logger from "./logger"
import { onMessages } from "../common/ipc-helpers";
import { ClusterIpcMessage } from "../common/ipc-messages";
import { FeatureInstallRequest } from "./feature";
import { tracker } from "../common/tracker";

export interface ClusterIconUpload {
  clusterId: string;
  name: string;
  path: string;
}

export class ClusterManager {
  static get clusterIconDir() {
    return path.join(app.getPath("userData"), "icons");
  }

  constructor(protected port: number) {
    autorun(() => {
      // fixme: detect and stop removed clusters from config file ?
      clusterStore.clusters.forEach((cluster: Cluster) => {
        if (!cluster.initialized) {
          cluster.init(this.port);
          cluster.refreshCluster();
        }
      })
    });

    ClusterManager.ipcListen(this);
  }

  stop() {
    clusterStore.clusters.forEach((cluster: Cluster) => {
      cluster.stopServer();
    })
  }

  protected getCluster(id: ClusterId) {
    return clusterStore.getById(id);
  }

  protected async addCluster(clusterModel: ClusterModel): Promise<Cluster> {
    tracker.event("cluster", "add");
    try {
      await validateConfig(clusterModel.kubeConfigPath);
      return clusterStore.addCluster({
        ...clusterModel,
        port: this.port,
      });
    } catch (error) {
      logger.error(`[CLUSTER-MANAGER]: add cluster error ${JSON.stringify(error)}`)
      throw error;
    }
  }

  protected stopCluster(clusterId: ClusterId) {
    tracker.event("cluster", "stop");
    this.getCluster(clusterId)?.stopServer();
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
      cluster.stopServer()
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
          req.url = req.url.replace(`/${clusterId}`, apiPrefix.KUBE_BASE)
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

  // todo: check feature failures
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

  protected async refreshCluster(clusterId: ClusterId) {
    await this.getCluster(clusterId)?.refreshCluster();
  }

  protected async getEventsCount(clusterId: ClusterId): Promise<number> {
    return await this.getCluster(clusterId)?.getEventCount() || 0;
  }

  static ipcListen(clusterManager: ClusterManager) {
    const handlers = {
      [ClusterIpcMessage.CLUSTER_ADD]: clusterManager.addCluster,
      [ClusterIpcMessage.CLUSTER_STOP]: clusterManager.stopCluster,
      [ClusterIpcMessage.CLUSTER_REMOVE]: clusterManager.removeCluster,
      [ClusterIpcMessage.CLUSTER_REMOVE_WORKSPACE]: clusterManager.removeAllByWorkspace,
      [ClusterIpcMessage.CLUSTER_REFRESH]: clusterManager.refreshCluster,
      [ClusterIpcMessage.CLUSTER_EVENTS]: clusterManager.getEventsCount,
      [ClusterIpcMessage.FEATURE_INSTALL]: clusterManager.installFeature,
      [ClusterIpcMessage.FEATURE_UPGRADE]: clusterManager.upgradeFeature,
      [ClusterIpcMessage.FEATURE_REMOVE]: clusterManager.uninstallFeature,
      [ClusterIpcMessage.ICON_SAVE]: clusterManager.uploadClusterIcon,
      [ClusterIpcMessage.ICON_RESET]: clusterManager.removeCluster,
    };
    Object.entries(handlers).forEach(([key, handler]) => {
      handlers[key as keyof typeof handlers] = handler.bind(clusterManager);
    })
    onMessages(handlers, {
      timeout: 2000,
    })
  }
}

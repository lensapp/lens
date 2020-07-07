import { autorun } from "mobx";
import { apiPrefix } from "../common/vars";
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
      clusterStore.clusters.forEach((cluster: Cluster) => {
        if (!cluster.initialized) {
          cluster.init(this.port);
          cluster.refreshCluster();
        }
      })
    });
    this.listenIpcEvents();
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

  protected removeAllByWorkspace(workspaceId: string) {
    const clusters = clusterStore.getByWorkspaceId(workspaceId);
    clusters.forEach(cluster => {
      this.removeCluster(cluster.id);
    });
  }

  protected removeCluster(clusterId: string): Cluster {
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

  protected async uploadClusterIcon(cluster: Cluster, fileName: string, src: string): Promise<string> {
    await ensureDir(ClusterManager.clusterIconDir)
    fileName = filenamify(cluster.contextName + "-" + fileName)
    const dest = path.join(ClusterManager.clusterIconDir, fileName)
    await copyFile(src, dest)
    return "store:///icons/" + fileName
  }

  protected listenIpcEvents() {
    onMessages({
      [ClusterIpcMessage.CLUSTER_ADD]: async (model: ClusterModel): Promise<boolean> => {
        await this.addCluster(model);
        return true;
      },
      [ClusterIpcMessage.CLUSTER_STOP]: (clusterId: ClusterId) => {
        this.getCluster(clusterId)?.stopServer();
      },
      [ClusterIpcMessage.CLUSTER_REFRESH]: (clusterId: ClusterId) => {
        this.getCluster(clusterId)?.refreshCluster();
      },
      [ClusterIpcMessage.CLUSTER_REMOVE]: (clusterId: ClusterId) => {
        this.removeCluster(clusterId);
      },
      [ClusterIpcMessage.CLUSTER_REMOVE_WORKSPACE]: (workspaceId: ClusterId) => {
        this.removeAllByWorkspace(workspaceId);
      },
      [ClusterIpcMessage.CLUSTER_EVENTS]: async (clusterId: ClusterId): Promise<number> => {
        return await this.getCluster(clusterId)?.getEventCount() || 0;
      },
      // todo: check feature failures
      [ClusterIpcMessage.FEATURE_INSTALL]: ({ clusterId, name, config }: FeatureInstallRequest) => {
        return this.getCluster(clusterId)?.installFeature(name, config)
      },
      [ClusterIpcMessage.FEATURE_UPGRADE]: ({ clusterId, name, config }: FeatureInstallRequest) => {
        return this.getCluster(clusterId)?.upgradeFeature(name, config)
      },
      [ClusterIpcMessage.FEATURE_REMOVE]: ({ clusterId, name }: FeatureInstallRequest) => {
        return this.getCluster(clusterId)?.uninstallFeature(name);
      },
      [ClusterIpcMessage.ICON_SAVE]: async ({ clusterId, name, path }: ClusterIconUpload) => {
        const cluster = this.getCluster(clusterId);
        if (!cluster) return false;
        cluster.preferences.icon = await this.uploadClusterIcon(cluster, name, path);
      },
      // todo: remove current file icon ?
      [ClusterIpcMessage.ICON_RESET]: async (clusterId: ClusterId) => {
        const cluster = this.getCluster(clusterId);
        if (!cluster) return false;
        cluster.preferences.icon = null;
      },
    }, {
      timeout: 2000,
    })
  }
}

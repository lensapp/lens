import { ContextHandler } from "./context-handler"
import { FeatureStatusMap } from "./feature"
import * as k8s from "./k8s"
import { clusterStore } from "../common/cluster-store"
import logger from "./logger"
import { KubeConfig, CoreV1Api, AuthorizationV1Api, V1ResourceAttributes } from "@kubernetes/client-node"
import * as fm from "./feature-manager";
import { Kubectl } from "./kubectl";
import { PromiseIpc } from "electron-promise-ipc"
import * as request from "request-promise-native"
import { KubeconfigManager } from "./kubeconfig-manager"

enum ClusterStatus {
  AccessGranted = 2,
  AccessDenied = 1,
  Offline = 0
}

export interface ClusterBaseInfo {
  id: string;
  kubeConfig: string;
  preferences?: ClusterPreferences;
  port?: number;
  workspace?: string;
}

export interface ClusterInfo extends ClusterBaseInfo {
  url: string;
  apiUrl: string;
  online?: boolean;
  accessible?: boolean;
  failureReason?: string;
  nodes?: number;
  version?: string;
  distribution?: string;
  isAdmin?: boolean;
  features?: FeatureStatusMap;
  kubeCtl?: Kubectl;
  contextName: string;
}

export type ClusterPreferences = {
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

export class Cluster implements ClusterInfo {
  public id: string;
  public workspace: string;
  public contextHandler: ContextHandler;
  public contextName: string;
  public url: string;
  public port: number;
  public apiUrl: string;
  public online: boolean;
  public accessible: boolean;
  public failureReason: string;
  public nodes: number;
  public version: string;
  public distribution: string;
  public isAdmin: boolean;
  public features: FeatureStatusMap;
  public kubeCtl: Kubectl
  public kubeConfig: string;
  public eventCount: number;
  public preferences: ClusterPreferences;

  protected eventPoller: NodeJS.Timeout;
  protected promiseIpc = new PromiseIpc({ timeout: 2000 })

  protected kubeconfigManager: KubeconfigManager;

  constructor(clusterInfo: ClusterBaseInfo) {
    if (clusterInfo) Object.assign(this, clusterInfo)
    if (!this.preferences) this.preferences = {}
    this.kubeconfigManager = new KubeconfigManager(this.kubeConfig)
  }

  public kubeconfigPath() {
    return this.kubeconfigManager.getPath()
  }

  public async init(kc: KubeConfig) {
    this.contextHandler = new ContextHandler(kc, this)
    this.contextName = kc.currentContext
    this.url = this.contextHandler.url
    this.apiUrl = kc.getCurrentCluster().server
  }

  public stopServer() {
    this.contextHandler.stopServer()
    clearInterval(this.eventPoller);
  }

  public async installFeature(name: string, config: any) {
    await fm.installFeature(name, this, config)
    return this.refreshCluster()
  }

  public async upgradeFeature(name: string, config: any) {
    await fm.upgradeFeature(name, this, config)
    return this.refreshCluster()
  }

  public async uninstallFeature(name: string) {
    await fm.uninstallFeature(name, this)
    return this.refreshCluster()
  }

  public async refreshCluster() {
    clusterStore.reloadCluster(this)
    this.contextHandler.setClusterPreferences(this.preferences)

    const connectionStatus = await this.getConnectionStatus()
    if (connectionStatus == ClusterStatus.AccessGranted) {
      this.accessible = true
    } else  {
      this.accessible = false
    }
    if (connectionStatus > ClusterStatus.Offline) {
      this.online = true
    } else {
      this.online = false
    }
    if (this.accessible) {
      this.distribution = this.detectKubernetesDistribution(this.version)
      this.features = await fm.getFeatures(this.contextHandler)
      this.isAdmin = await this.isClusterAdmin()
      this.nodes = await this.getNodeCount()
      this.kubeCtl = new Kubectl(this.version)
      this.kubeCtl.ensureKubectl()
    }
    this.eventCount = await this.getEventCount();
  }

  public updateKubeconfig(kubeconfig: string) {
    const storedCluster = clusterStore.getCluster(this.id)
    if (!storedCluster) { return }

    this.kubeConfig = kubeconfig
    this.save()
  }

  public getPrometheusApiPrefix() {
    if (!this.preferences.prometheus?.prefix) {
      return ""
    }
    return this.preferences.prometheus.prefix
  }

  public save() {
    clusterStore.storeCluster(this)
  }

  public toClusterInfo(): ClusterInfo {
    const clusterInfo: ClusterInfo = {
      id: this.id,
      workspace: this.workspace,
      url: this.url,
      contextName: this.contextHandler.kc.currentContext,
      apiUrl: this.apiUrl,
      online: this.online,
      accessible: this.accessible,
      failureReason: this.failureReason,
      nodes: this.nodes,
      version: this.version,
      distribution: this.distribution,
      isAdmin: this.isAdmin,
      features: this.features,
      kubeCtl: this.kubeCtl,
      kubeConfig:  this.kubeConfig,
      preferences: this.preferences
    }
    return clusterInfo;
  }

  protected async k8sRequest(path: string, opts?: request.RequestPromiseOptions) {
    const options = Object.assign({
      json: true, timeout: 10000
    }, (opts || {}))
    if (!options.headers) { options.headers = {} }
    options.headers.host = `${this.id}.localhost:${this.port}`

    return request(`http://127.0.0.1:${this.port}/api-kube${path}`, options)
  }

  protected async getConnectionStatus() {
    try {
      const response = await this.k8sRequest("/version")
      this.version = response.gitVersion
      this.failureReason = null
      return ClusterStatus.AccessGranted;
    } catch(error) {
      logger.error(`Failed to connect to cluster ${this.contextName}: ${JSON.stringify(error)}`)
      if (error.statusCode) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          this.failureReason = "Invalid credentials";
          return ClusterStatus.AccessDenied;
        } else {
          this.failureReason = error.error || error.message;
          return ClusterStatus.Offline;
        }
      } else if (error.failed === true) {
        if (error.timedOut === true) {
          this.failureReason = "Connection timed out";
          return ClusterStatus.Offline;
        } else {
          this.failureReason = "Failed to fetch credentials";
          return ClusterStatus.AccessDenied;
        }
      }
      this.failureReason = error.message;
      return ClusterStatus.Offline;
    }
  }

  public async canI(resourceAttributes: V1ResourceAttributes): Promise<boolean> {
    const authApi = this.contextHandler.kc.makeApiClient(AuthorizationV1Api)
    try {
      const accessReview = await authApi.createSelfSubjectAccessReview({
        apiVersion: "authorization.k8s.io/v1",
        kind: "SelfSubjectAccessReview",
        spec: { resourceAttributes }
      })
      return accessReview.body.status.allowed === true
    } catch(error) {
      logger.error(`failed to request selfSubjectAccessReview: ${error.message}`)
      return false
    }
  }

  protected async isClusterAdmin(): Promise<boolean> {
    return this.canI({
      namespace: "kube-system",
      resource: "*",
      verb: "create",
    })
  }

  protected detectKubernetesDistribution(kubernetesVersion: string): string {
    if (kubernetesVersion.includes("gke")) {
      return "gke"
    }
    else if (kubernetesVersion.includes("eks")) {
      return "eks"
    }
    else if (kubernetesVersion.includes("IKS")) {
      return "iks"
    }
    else if(this.apiUrl.endsWith("azmk8s.io")) {
      return "aks"
    }
    else if(this.apiUrl.endsWith("k8s.ondigitalocean.com")) {
      return "digitalocean"
    }
    else if (this.contextHandler.contextName.startsWith("minikube")) {
      return "minikube"
    }
    else if (kubernetesVersion.includes("+")) {
      return "custom"
    }

    return "vanilla"
  }

  protected async getNodeCount() {
    try {
      const response = await this.k8sRequest("/api/v1/nodes")
      return response.items.length
    } catch(error) {
      logger.debug(`failed to request node list: ${error.message}`)
      return null
    }
  }

  public async getEventCount(): Promise<number> {
    if (!this.isAdmin) {
      return 0;
    }
    const client = this.contextHandler.kc.makeApiClient(CoreV1Api);
    try {
      const response = await client.listEventForAllNamespaces(false, null, null, null, 1000);
      const uniqEventSources = new Set();
      const warnings = response.body.items.filter(e => e.type !== 'Normal');
      for (const w of warnings) {
        if(w.involvedObject.kind === 'Pod') {
          try {
            const pod = (await client.readNamespacedPod(w.involvedObject.name, w.involvedObject.namespace)).body;
            logger.debug(`checking pod ${w.involvedObject.namespace}/${w.involvedObject.name}`)
            if(k8s.podHasIssues(pod)) {
              uniqEventSources.add(w.involvedObject.uid);
            }
            continue;
          } catch (error) {
            continue;
          }
        } else {
          uniqEventSources.add(w.involvedObject.uid);
        }
      }
      let nodeNotificationCount = 0;
      const nodes = (await client.listNode()).body.items;
      nodes.map(n => {
        nodeNotificationCount = nodeNotificationCount + k8s.getNodeWarningConditions(n).length
      });
      return uniqEventSources.size + nodeNotificationCount;
    } catch (error) {
      logger.error("Failed to fetch event count: " + JSON.stringify(error))
      return 0;
    }
  }
}

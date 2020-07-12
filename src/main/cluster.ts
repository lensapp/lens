import type { ClusterId, ClusterModel, ClusterPreferences } from "../common/cluster-store"
import type { FeatureStatusMap } from "./feature"
import { action, observable, toJS } from "mobx";
import { apiKubePrefix } from "../common/vars";
import { ContextHandler } from "./context-handler"
import { AuthorizationV1Api, CoreV1Api, KubeConfig, V1ResourceAttributes } from "@kubernetes/client-node"
import { Kubectl } from "./kubectl";
import { KubeconfigManager } from "./kubeconfig-manager"
import { getNodeWarningConditions, loadConfig, podHasIssues } from "./k8s"
import { getFeatures, installFeature, uninstallFeature, upgradeFeature } from "./feature-manager";
import request, { RequestPromiseOptions } from "request-promise-native"
import logger from "./logger"

enum ClusterStatus {
  AccessGranted = 2,
  AccessDenied = 1,
  Offline = 0
}

export class Cluster implements ClusterModel {
  public id: ClusterId;
  public kubeCtl: Kubectl
  public contextHandler: ContextHandler;
  protected kubeconfigManager: KubeconfigManager;

  @observable initialized = false;
  @observable contextName: string;
  @observable workspace: string;
  @observable kubeConfigPath: string;
  @observable url: string; // cluster-api url
  @observable proxyUrl: string; // lens-proxy url
  @observable webContentUrl: string;
  @observable proxyPort: number;
  @observable online: boolean;
  @observable accessible: boolean;
  @observable failureReason: string;
  @observable nodes = 0;
  @observable version: string;
  @observable distribution = "unknown";
  @observable isAdmin = false;
  @observable eventCount = 0; // todo: auto-fetch every 3s and push updates to client (?)
  @observable preferences: ClusterPreferences = {};
  @observable features: FeatureStatusMap = {};

  constructor(model: ClusterModel) {
    this.updateModel(model);
  }

  @action
  updateModel(model: ClusterModel) {
    Object.assign(this, model);
    this.url = this.getKubeconfig().getCurrentCluster().server;
    this.contextName = this.preferences.clusterName;
  }

  @action
  async init(proxyPort: number) {
    try {
      this.proxyPort = proxyPort;
      this.contextHandler = new ContextHandler(this);
      this.kubeconfigManager = new KubeconfigManager(this, this.contextHandler);
      this.proxyUrl = `http://localhost:${proxyPort}`;
      this.webContentUrl = `http://${this.id}.localhost:${proxyPort}`;
      this.initialized = true;
      logger.info(`[CLUSTER]: init success`, {
        id: this.id,
        url: this.url,
        proxyUrl: this.proxyUrl,
        webContentUrl: this.webContentUrl,
      });
    } catch (err) {
      logger.error(`[CLUSTER]: init error`, {
        id: this.id,
        error: err.stack,
      });
    }
  }

  stop() {
    if (!this.initialized) return;
    this.contextHandler.stopServer();
    this.kubeconfigManager.unlink();
  }

  @action
  async refreshStatus() {
    const connectionStatus = await this.getConnectionStatus();
    this.online = connectionStatus > ClusterStatus.Offline;
    this.accessible = connectionStatus == ClusterStatus.AccessGranted;
    if (this.accessible) {
      this.distribution = this.detectKubernetesDistribution(this.version)
      this.features = await getFeatures(this)
      this.isAdmin = await this.isClusterAdmin()
      this.nodes = await this.getNodeCount()
      this.kubeCtl = new Kubectl(this.version)
      this.kubeCtl.ensureKubectl()
    }
    this.eventCount = await this.getEventCount();
  }

  protected getKubeconfig(): KubeConfig {
    return loadConfig(this.kubeConfigPath);
  }

  getProxyKubeconfig(): KubeConfig {
    return loadConfig(this.getProxyKubeconfigPath());
  }

  getProxyKubeconfigPath(): string {
    return this.kubeconfigManager.getPath()
  }

  async installFeature(name: string, config: any) {
    await installFeature(name, this, config)
    await this.refreshStatus()
  }

  async upgradeFeature(name: string, config: any) {
    await upgradeFeature(name, this, config)
    await this.refreshStatus()
  }

  async uninstallFeature(name: string) {
    await uninstallFeature(name, this)
    await this.refreshStatus()
  }

  getPrometheusApiPrefix() {
    return this.preferences.prometheus?.prefix || ""
  }

  protected k8sRequest(path: string, options: RequestPromiseOptions = {}) {
    const apiUrl = this.proxyUrl + apiKubePrefix + path;
    return request(apiUrl, {
      json: true,
      timeout: 10000,
      headers: {
        ...(options.headers || {}),
        host: `${this.id}.localhost:${this.proxyPort}`,
      }
    })
  }

  protected async getConnectionStatus(): Promise<ClusterStatus> {
    try {
      const response = await this.k8sRequest("/version")
      this.version = response.gitVersion
      this.failureReason = null
      return ClusterStatus.AccessGranted;
    } catch (error) {
      logger.error(`Failed to connect cluster "${this.contextName}": ${error.stack}`)
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

  async canI(resourceAttributes: V1ResourceAttributes): Promise<boolean> {
    const authApi = this.getProxyKubeconfig().makeApiClient(AuthorizationV1Api)
    try {
      const accessReview = await authApi.createSelfSubjectAccessReview({
        apiVersion: "authorization.k8s.io/v1",
        kind: "SelfSubjectAccessReview",
        spec: { resourceAttributes }
      })
      return accessReview.body.status.allowed
    } catch (error) {
      logger.error(`failed to request selfSubjectAccessReview: ${error.message}`)
      return false
    }
  }

  async isClusterAdmin(): Promise<boolean> {
    return this.canI({
      namespace: "kube-system",
      resource: "*",
      verb: "create",
    })
  }

  protected detectKubernetesDistribution(kubernetesVersion: string): string {
    if (kubernetesVersion.includes("gke")) return "gke"
    if (kubernetesVersion.includes("eks")) return "eks"
    if (kubernetesVersion.includes("IKS")) return "iks"
    if (this.url.endsWith("azmk8s.io")) return "aks"
    if (this.url.endsWith("k8s.ondigitalocean.com")) return "digitalocean"
    if (this.contextName.startsWith("minikube")) return "minikube"
    if (kubernetesVersion.includes("+")) return "custom"
    return "vanilla"
  }

  protected async getNodeCount(): Promise<number> {
    try {
      const response = await this.k8sRequest("/api/v1/nodes")
      return response.items.length
    } catch (error) {
      logger.debug(`failed to request node list: ${error.message}`)
      return null
    }
  }

  protected async getEventCount(): Promise<number> {
    if (!this.isAdmin) {
      return 0;
    }
    const client = this.getProxyKubeconfig().makeApiClient(CoreV1Api);
    try {
      const response = await client.listEventForAllNamespaces(false, null, null, null, 1000);
      const uniqEventSources = new Set();
      const warnings = response.body.items.filter(e => e.type !== 'Normal');
      for (const w of warnings) {
        if (w.involvedObject.kind === 'Pod') {
          try {
            const pod = (await client.readNamespacedPod(w.involvedObject.name, w.involvedObject.namespace)).body;
            logger.debug(`checking pod ${w.involvedObject.namespace}/${w.involvedObject.name}`)
            if (podHasIssues(pod)) {
              uniqEventSources.add(w.involvedObject.uid);
            }
          } catch (err) {
          }
        } else {
          uniqEventSources.add(w.involvedObject.uid);
        }
      }
      let nodeNotificationCount = 0;
      const nodes = (await client.listNode()).body.items;
      nodes.map(n => {
        nodeNotificationCount = nodeNotificationCount + getNodeWarningConditions(n).length
      });
      return uniqEventSources.size + nodeNotificationCount;
    } catch (error) {
      logger.error("Failed to fetch event count: " + JSON.stringify(error))
      return 0;
    }
  }

  toJSON(): ClusterModel {
    return toJS({
      id: this.id,
      contextName: this.contextName,
      kubeConfigPath: this.kubeConfigPath,
      workspace: this.workspace,
      preferences: this.preferences,
    }, {
      recurseEverything: true
    })
  }
}

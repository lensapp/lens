import { observable } from "mobx";
import { apiPrefix } from "../common/vars";
import { ContextHandler } from "./context-handler"
import { FeatureStatusMap } from "./feature"
import { AuthorizationV1Api, CoreV1Api, KubeConfig, V1ResourceAttributes } from "@kubernetes/client-node"
import { Kubectl } from "./kubectl";
import { KubeconfigManager } from "./kubeconfig-manager"
import { getNodeWarningConditions, loadConfig, podHasIssues } from "./k8s"
import { getFeatures, installFeature, uninstallFeature, upgradeFeature } from "./feature-manager";
import type { ClusterId, ClusterModel, ClusterPreferences } from "../common/cluster-store"
import request from "request-promise-native"
import logger from "./logger"

enum ClusterStatus {
  AccessGranted = 2,
  AccessDenied = 1,
  Offline = 0
}

export class Cluster implements ClusterModel {
  @observable initialized = false;
  @observable id: ClusterId;
  @observable workspace: string;
  @observable kubeConfigPath: string;
  @observable contextName: string;
  @observable preferences: ClusterPreferences = {};

  public contextHandler: ContextHandler;
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
  public eventCount: number;
  public kubeCtl: Kubectl
  public features: FeatureStatusMap = {};

  protected kubeconfigManager: KubeconfigManager;

  constructor(model: ClusterModel) {
    Object.assign(this, model)
  }

  async init(port: number) {
    const { contextName } = this
    try {
      const kubeConfig = loadConfig(this.kubeConfigPath)
      kubeConfig.setCurrentContext(contextName); // fixme: is it needed at all?
      this.port = port;
      this.apiUrl = kubeConfig.getCurrentCluster().server
      this.contextHandler = new ContextHandler(kubeConfig, this)
      await this.contextHandler.init() // So we get the proxy port reserved
      this.kubeconfigManager = new KubeconfigManager(this)
      this.url = this.contextHandler.url
      this.initialized = true;
      logger.debug(`[CLUSTER]: init done for "${this.id}", context ${contextName}`);
    } catch (err) {
      logger.error(`[CLUSTER]: init "${this.id}" has failed`, { err, contextName });
    }
  }

  async refreshCluster() {
    this.contextHandler.setClusterPreferences(this.preferences)

    const connectionStatus = await this.getConnectionStatus()
    this.accessible = connectionStatus == ClusterStatus.AccessGranted;
    this.online = connectionStatus > ClusterStatus.Offline;

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

  proxyKubeconfigPath() {
    return this.kubeconfigManager.getPath()
  }

  proxyKubeconfig() {
    const kc = new KubeConfig()
    kc.loadFromFile(this.proxyKubeconfigPath())
    return kc
  }

  stopServer() {
    this.contextHandler.stopServer()
  }

  async installFeature(name: string, config: any) {
    await installFeature(name, this, config)
    await this.refreshCluster()
  }

  async upgradeFeature(name: string, config: any) {
    await upgradeFeature(name, this, config)
    await this.refreshCluster()
  }

  async uninstallFeature(name: string) {
    await uninstallFeature(name, this)
    await this.refreshCluster()
  }

  getPrometheusApiPrefix() {
    return this.preferences.prometheus?.prefix || ""
  }

  protected async k8sRequest(path: string, opts?: request.RequestPromiseOptions) {
    const options = Object.assign({
      json: true,
      timeout: 10000
    }, (opts || {}))
    if (!options.headers) {
      options.headers = {}
    }
    options.headers.host = `${this.id}.localhost:${this.port}`
    return request(`http://127.0.0.1:${this.port}${apiPrefix.KUBE_BASE}${path}`, options)
  }

  protected async getConnectionStatus() {
    try {
      const response = await this.k8sRequest("/version")
      this.version = response.gitVersion
      this.failureReason = null
      return ClusterStatus.AccessGranted;
    } catch (error) {
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

  async canI(resourceAttributes: V1ResourceAttributes): Promise<boolean> {
    const authApi = this.proxyKubeconfig().makeApiClient(AuthorizationV1Api)
    try {
      const accessReview = await authApi.createSelfSubjectAccessReview({
        apiVersion: "authorization.k8s.io/v1",
        kind: "SelfSubjectAccessReview",
        spec: { resourceAttributes }
      })
      return accessReview.body.status.allowed === true
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
    const { apiUrl, contextName } = this
    if (kubernetesVersion.includes("gke")) return "gke"
    if (kubernetesVersion.includes("eks")) return "eks"
    if (kubernetesVersion.includes("IKS")) return "iks"
    if (apiUrl.endsWith("azmk8s.io")) return "aks"
    if (apiUrl.endsWith("k8s.ondigitalocean.com")) return "digitalocean"
    if (contextName.startsWith("minikube")) return "minikube"
    if (kubernetesVersion.includes("+")) return "custom"
    return "vanilla"
  }

  protected async getNodeCount() {
    try {
      const response = await this.k8sRequest("/api/v1/nodes")
      return response.items.length
    } catch (error) {
      logger.debug(`failed to request node list: ${error.message}`)
      return null
    }
  }

  async getEventCount(): Promise<number> {
    if (!this.isAdmin) {
      return 0;
    }
    const client = this.proxyKubeconfig().makeApiClient(CoreV1Api);
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
    return {
      id: this.id,
      contextName: this.contextName,
      kubeConfigPath: this.kubeConfigPath,
      workspace: this.workspace,
      preferences: this.preferences,
    }
  }
}

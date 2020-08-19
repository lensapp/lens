import type { ClusterId, ClusterModel, ClusterPreferences } from "../common/cluster-store"
import type { IMetricsReqParams } from "../renderer/api/endpoints/metrics.api";
import type { WorkspaceId } from "../common/workspace-store";
import type { FeatureStatusMap } from "./feature"
import { action, computed, observable, reaction, toJS, when } from "mobx";
import { apiKubePrefix } from "../common/vars";
import { broadcastIpc } from "../common/ipc";
import { ContextHandler } from "./context-handler"
import { AuthorizationV1Api, CoreV1Api, KubeConfig, V1ResourceAttributes } from "@kubernetes/client-node"
import { Kubectl } from "./kubectl";
import { KubeconfigManager } from "./kubeconfig-manager"
import { getNodeWarningConditions, loadConfig, podHasIssues } from "../common/kube-helpers"
import { getFeatures, installFeature, uninstallFeature, upgradeFeature } from "./feature-manager";
import request, { RequestPromiseOptions } from "request-promise-native"
import { apiResources } from "../common/rbac";
import logger from "./logger"

export enum ClusterStatus {
  AccessGranted = 2,
  AccessDenied = 1,
  Offline = 0
}

export interface ClusterState extends ClusterModel {
  initialized: boolean;
  apiUrl: string;
  online: boolean;
  disconnected: boolean;
  accessible: boolean;
  failureReason: string;
  nodes: number;
  eventCount: number;
  version: string;
  distribution: string;
  isAdmin: boolean;
  allowedNamespaces: string[]
  allowedResources: string[]
  features: FeatureStatusMap;
}

export class Cluster implements ClusterModel {
  public id: ClusterId;
  public frameId: number;
  public kubeCtl: Kubectl
  public contextHandler: ContextHandler;
  protected kubeconfigManager: KubeconfigManager;
  protected eventDisposers: Function[] = [];

  whenInitialized = when(() => this.initialized);

  @observable initialized = false;
  @observable contextName: string;
  @observable workspace: WorkspaceId;
  @observable kubeConfigPath: string;
  @observable apiUrl: string; // cluster server url
  @observable kubeProxyUrl: string; // lens-proxy to kube-api url
  @observable online: boolean;
  @observable accessible: boolean;
  @observable disconnected: boolean;
  @observable failureReason: string;
  @observable nodes = 0;
  @observable version: string;
  @observable distribution = "unknown";
  @observable isAdmin = false;
  @observable eventCount = 0;
  @observable preferences: ClusterPreferences = {};
  @observable features: FeatureStatusMap = {};
  @observable allowedNamespaces: string[] = [];
  @observable allowedResources: string[] = [];

  @computed get available() {
    return this.accessible && !this.disconnected;
  }

  constructor(model: ClusterModel) {
    this.updateModel(model);
  }

  @action
  updateModel(model: ClusterModel) {
    Object.assign(this, model);
    this.apiUrl = this.getKubeconfig().getCurrentCluster()?.server;
    this.contextName = this.contextName || this.preferences.clusterName;
  }

  @action
  async init(port: number) {
    try {
      this.contextHandler = new ContextHandler(this);
      this.kubeconfigManager = new KubeconfigManager(this, this.contextHandler);
      this.kubeProxyUrl = `http://localhost:${port}${apiKubePrefix}`;
      this.initialized = true;
      logger.info(`[CLUSTER]: "${this.contextName}" init success`, {
        id: this.id,
        context: this.contextName,
        apiUrl: this.apiUrl
      });
    } catch (err) {
      logger.error(`[CLUSTER]: init failed: ${err}`, {
        id: this.id,
        error: err,
      });
    }
  }

  protected bindEvents() {
    logger.info(`[CLUSTER]: bind events`, this.getMeta());
    const refreshTimer = setInterval(() => this.online && this.refresh(), 30000); // every 30s
    const refreshEventsTimer = setInterval(() => this.online && this.refreshEvents(), 3000); // every 3s

    this.eventDisposers.push(
      reaction(this.getState, this.pushState),
      () => clearInterval(refreshTimer),
      () => clearInterval(refreshEventsTimer),
    );
  }

  protected unbindEvents() {
    logger.info(`[CLUSTER]: unbind events`, this.getMeta());
    this.eventDisposers.forEach(dispose => dispose());
    this.eventDisposers.length = 0;
  }

  async activate() {
    logger.info(`[CLUSTER]: activate`, this.getMeta());
    await this.whenInitialized;
    if (!this.eventDisposers.length) {
      this.bindEvents();
    }
    if (this.disconnected) {
      await this.reconnect();
    }
    await this.refresh();
    return this.pushState();
  }

  async reconnect() {
    logger.info(`[CLUSTER]: reconnect`, this.getMeta());
    this.contextHandler.stopServer();
    await this.contextHandler.ensureServer();
    this.disconnected = false;
  }

  @action
  disconnect() {
    logger.info(`[CLUSTER]: disconnect`, this.getMeta());
    this.unbindEvents();
    this.contextHandler.stopServer();
    this.disconnected = true;
    this.online = false;
    this.accessible = false;
    this.pushState();
  }

  @action
  async refresh() {
    logger.info(`[CLUSTER]: refresh`, this.getMeta());
    await this.refreshConnectionStatus(); // refresh "version", "online", etc.
    if (this.accessible) {
      this.kubeCtl = new Kubectl(this.version)
      this.distribution = this.detectKubernetesDistribution(this.version)
      const [features, isAdmin, nodesCount] = await Promise.all([
        getFeatures(this),
        this.isClusterAdmin(),
        this.getNodeCount(),
        this.kubeCtl.ensureKubectl()
      ]);
      this.features = features;
      this.isAdmin = isAdmin;
      this.nodes = nodesCount;
      await Promise.all([
        this.refreshEvents(),
        this.refreshAllowedResources(),
      ]);
    }
  }

  @action
  async refreshConnectionStatus() {
    const connectionStatus = await this.getConnectionStatus();
    this.online = connectionStatus > ClusterStatus.Offline;
    this.accessible = connectionStatus == ClusterStatus.AccessGranted;
  }

  @action
  async refreshAllowedResources() {
    this.allowedNamespaces = await this.getAllowedNamespaces();
    this.allowedResources = await this.getAllowedResources();
  }

  @action
  async refreshEvents() {
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
    return installFeature(name, this, config)
  }

  async upgradeFeature(name: string, config: any) {
    return upgradeFeature(name, this, config)
  }

  async uninstallFeature(name: string) {
    return uninstallFeature(name, this)
  }

  protected async k8sRequest<T = any>(path: string, options: RequestPromiseOptions = {}): Promise<T> {
    const apiUrl = this.kubeProxyUrl + path;
    return request(apiUrl, {
      json: true,
      timeout: 5000,
      ...options,
      headers: {
        Host: `${this.id}.${new URL(this.kubeProxyUrl).host}`, // required in ClusterManager.getClusterForRequest()
        ...(options.headers || {}),
      },
    })
  }

  getMetrics(prometheusPath: string, queryParams: IMetricsReqParams & { query: string }) {
    const prometheusPrefix = this.preferences.prometheus?.prefix || "";
    const metricsPath = `/api/v1/namespaces/${prometheusPath}/proxy${prometheusPrefix}/api/v1/query_range`;
    return this.k8sRequest(metricsPath, {
      timeout: 0,
      resolveWithFullResponse: false,
      json: true,
      qs: queryParams,
    })
  }

  protected async getConnectionStatus(): Promise<ClusterStatus> {
    try {
      const response = await this.k8sRequest("/version")
      this.version = response.gitVersion
      this.failureReason = null
      return ClusterStatus.AccessGranted;
    } catch (error) {
      logger.error(`Failed to connect cluster "${this.contextName}": ${error}`)
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
      logger.error(`failed to request selfSubjectAccessReview: ${error}`)
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
    if (this.apiUrl.endsWith("azmk8s.io")) return "aks"
    if (this.apiUrl.endsWith("k8s.ondigitalocean.com")) return "digitalocean"
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
    const model: ClusterModel = {
      id: this.id,
      contextName: this.contextName,
      kubeConfigPath: this.kubeConfigPath,
      workspace: this.workspace,
      preferences: this.preferences,
    };
    return toJS(model, {
      recurseEverything: true
    })
  }

  // serializable cluster-state used for sync btw main <-> renderer
  getState = (): ClusterState => {
    const state: ClusterState = {
      ...this.toJSON(),
      initialized: this.initialized,
      apiUrl: this.apiUrl,
      online: this.online,
      disconnected: this.disconnected,
      accessible: this.accessible,
      failureReason: this.failureReason,
      nodes: this.nodes,
      version: this.version,
      distribution: this.distribution,
      isAdmin: this.isAdmin,
      features: this.features,
      eventCount: this.eventCount,
      allowedNamespaces: this.allowedNamespaces,
      allowedResources: this.allowedResources,
    };
    return toJS(state, {
      recurseEverything: true
    })
  }

  pushState = (state = this.getState()): ClusterState => {
    logger.debug(`[CLUSTER]: push-state`, state);
    broadcastIpc({
      channel: "cluster:state",
      frameId: this.frameId,
      args: [state],
    });
    return state;
  }

  // get cluster system meta, e.g. use in "logger"
  getMeta() {
    return {
      id: this.id,
      name: this.contextName,
      initialized: this.initialized,
      online: this.online,
      accessible: this.accessible,
      disconnected: this.disconnected,
    }
  }

  protected async getAllowedNamespaces() {
    const api = this.getProxyKubeconfig().makeApiClient(CoreV1Api)
    try {
      const namespaceList = await api.listNamespace()
      const nsAccessStatuses = await Promise.all(
        namespaceList.body.items.map(ns => this.canI({
          namespace: ns.metadata.name,
          resource: "pods",
          verb: "list",
        }))
      )
      return namespaceList.body.items
        .filter((ns, i) => nsAccessStatuses[i])
        .map(ns => ns.metadata.name)
    } catch (error) {
      const ctx = this.getProxyKubeconfig().getContextObject(this.contextName)
      if (ctx.namespace) return [ctx.namespace]
      return []
    }
  }

  protected async getAllowedResources() {
    try {
      if (!this.allowedNamespaces.length) {
        return [];
      }
      const resourceAccessStatuses = await Promise.all(
        apiResources.map(apiResource => this.canI({
          resource: apiResource.resource,
          group: apiResource.group,
          verb: "list",
          namespace: this.allowedNamespaces[0]
        }))
      )
      return apiResources
        .filter((resource, i) => resourceAccessStatuses[i])
        .map(apiResource => apiResource.resource)
    } catch (error) {
      return []
    }
  }
}

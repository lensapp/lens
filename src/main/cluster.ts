import type { ClusterId, ClusterModel, ClusterPreferences } from "../common/cluster-store"
import type { FeatureStatusMap } from "./feature"
import type { WorkspaceId } from "../common/workspace-store";
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
import logger from "./logger"

export enum ClusterIpcChannel {
  INIT = "cluster:init",
  DISCONNECT = "cluster:disconnect",
  RECONNECT = "cluster:reconnect",
}

export enum ClusterStatus {
  AccessGranted = 2,
  AccessDenied = 1,
  Offline = 0
}

export interface ClusterState extends ClusterModel {
  initialized?: boolean;
  apiUrl: string;
  online?: boolean;
  accessible?: boolean;
  failureReason?: string;
  nodes?: number;
  eventCount?: number;
  version?: string;
  distribution?: string;
  isAdmin?: boolean;
  features?: FeatureStatusMap;
}

export class Cluster implements ClusterModel {
  public id: ClusterId;
  public kubeCtl: Kubectl
  public contextHandler: ContextHandler;
  protected kubeconfigManager: KubeconfigManager;
  protected disposers: Function[] = [];

  @observable initialized = false;
  @observable contextName: string;
  @observable workspace: WorkspaceId;
  @observable kubeConfigPath: string;
  @observable apiUrl: string; // cluster server url
  @observable kubeProxyUrl: string; // lens-proxy to kube-api url
  @observable webContentUrl: string; // page content url for loading in renderer
  @observable online: boolean;
  @observable accessible: boolean;
  @observable failureReason: string;
  @observable nodes = 0;
  @observable version: string;
  @observable distribution = "unknown";
  @observable isAdmin = false;
  @observable eventCount = 0;
  @observable preferences: ClusterPreferences = {};
  @observable features: FeatureStatusMap = {};

  constructor(model: ClusterModel) {
    this.updateModel(model);
  }

  @computed get isReady() {
    return this.initialized && this.accessible === true;
  }

  @action
  updateModel(model: ClusterModel) {
    Object.assign(this, model);
    this.apiUrl = this.getKubeconfig().getCurrentCluster().server;
    this.contextName = this.contextName || this.preferences.clusterName;
  }

  @action
  async init(port: number) {
    try {
      this.contextHandler = new ContextHandler(this);
      this.kubeconfigManager = new KubeconfigManager(this, this.contextHandler);
      this.kubeProxyUrl = `http://localhost:${port}${apiKubePrefix}`;
      this.webContentUrl = `http://${this.id}.localhost:${port}`;
      this.initialized = true;
      logger.info(`[CLUSTER]: init success`, {
        id: this.id,
        serverUrl: this.apiUrl,
        webContentUrl: this.webContentUrl,
        kubeProxyUrl: this.kubeProxyUrl,
      });
    } catch (err) {
      logger.error(`[CLUSTER]: init failed: ${err}`, {
        id: this.id,
        error: err,
      });
    }
  }

  bindEvents() {
    logger.info(`[CLUSTER]: bind events`, this.getMeta());
    const refreshStatusTimer = setInterval(() => this.refreshStatus(), 30000); // every 30s
    const refreshEventsTimer = setInterval(() => this.refreshEvents(), 3000); // every 3s

    this.disposers.push(
      () => clearInterval(refreshStatusTimer),
      () => clearInterval(refreshEventsTimer),
      reaction(this.getState, this.pushState, {
        fireImmediately: true
      })
    );
  }

  unbindEvents() {
    logger.info(`[CLUSTER]: unbind events`, this.getMeta());
    this.disposers.forEach(dispose => dispose());
    this.disposers.length = 0;
  }

  // fixme: possibly doesn't work as expected
  async reconnect() {
    logger.info(`[CLUSTER]: reconnect`, this.getMeta());
    await this.contextHandler.stopServer();
    await this.contextHandler.ensureServer();
  }

  disconnect() {
    logger.info(`[CLUSTER]: disconnect`, this.getMeta());
    this.contextHandler.stopServer();
    this.unbindEvents();
  }

  @action
  async refreshStatus() {
    await when(() => this.initialized);
    logger.info(`[CLUSTER]: refreshing status`, this.getMeta());
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
    await this.refreshEvents();
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
    return await installFeature(name, this, config)
  }

  async upgradeFeature(name: string, config: any) {
    return await upgradeFeature(name, this, config)
  }

  async uninstallFeature(name: string) {
    return await uninstallFeature(name, this)
  }

  getPrometheusApiPrefix() {
    return this.preferences.prometheus?.prefix || ""
  }

  protected async k8sRequest(path: string, options: RequestPromiseOptions = {}) {
    const apiUrl = this.kubeProxyUrl + path;
    return request(apiUrl, {
      json: true,
      timeout: 10000,
      headers: {
        ...(options.headers || {}),
        Host: new URL(this.webContentUrl).host,
      },
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

  // serializable cluster-state (mostly used for push-notifications)
  getState = (): ClusterState => {
    const state: ClusterState = {
      ...this.toJSON(),
      initialized: this.initialized,
      apiUrl: this.apiUrl,
      online: this.online,
      accessible: this.accessible,
      failureReason: this.failureReason,
      nodes: this.nodes,
      version: this.version,
      distribution: this.distribution,
      isAdmin: this.isAdmin,
      features: this.features,
      eventCount: this.eventCount,
    };
    return toJS(state, {
      recurseEverything: true
    })
  }

  pushState = (clusterState = this.getState()) => {
    logger.info(`[CLUSTER]: push-state`, clusterState);
    broadcastIpc({
      // webContentId: viewId, // todo: send to cluster-view only
      channel: "cluster:state",
      args: [clusterState],
    })
  }

  // get cluster system meta, e.g. use in "logger"
  getMeta() {
    return {
      id: this.id,
      name: this.contextName,
    }
  }
}

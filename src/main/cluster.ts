import { ipcMain } from "electron"
import type { ClusterId, ClusterMetadata, ClusterModel, ClusterPreferences } from "../common/cluster-store"
import type { IMetricsReqParams } from "../renderer/api/endpoints/metrics.api";
import type { WorkspaceId } from "../common/workspace-store";
import { action, computed, observable, reaction, toJS, when } from "mobx";
import { apiKubePrefix } from "../common/vars";
import { broadcastIpc } from "../common/ipc";
import { ContextHandler } from "./context-handler"
import { AuthorizationV1Api, CoreV1Api, KubeConfig, V1ResourceAttributes } from "@kubernetes/client-node"
import { Kubectl } from "./kubectl";
import { KubeconfigManager } from "./kubeconfig-manager"
import { getNodeWarningConditions, loadConfig, podHasIssues } from "../common/kube-helpers"
import request, { RequestPromiseOptions } from "request-promise-native"
import { apiResources } from "../common/rbac";
import logger from "./logger"
import { VersionDetector } from "./cluster-detectors/version-detector";
import { detectorRegistry } from "./cluster-detectors/detector-registry";

export enum ClusterStatus {
  AccessGranted = 2,
  AccessDenied = 1,
  Offline = 0
}

export enum ClusterMetadataKey {
  VERSION = "version",
  CLUSTER_ID = "id",
  DISTRIBUTION = "distribution",
  NODES_COUNT = "nodes",
  LAST_SEEN = "lastSeen"
}

export type ClusterRefreshOptions = {
  refreshMetadata?: boolean
}

export interface ClusterState {
  initialized: boolean;
  apiUrl: string;
  online: boolean;
  disconnected: boolean;
  accessible: boolean;
  ready: boolean;
  failureReason: string;
  eventCount: number;
  isAdmin: boolean;
  allowedNamespaces: string[]
  allowedResources: string[]
}

export class Cluster implements ClusterModel, ClusterState {
  public id: ClusterId;
  public frameId: number;
  public kubeCtl: Kubectl
  public contextHandler: ContextHandler;
  public ownerRef: string;
  protected kubeconfigManager: KubeconfigManager;
  protected eventDisposers: Function[] = [];
  protected activated = false;

  whenInitialized = when(() => this.initialized);
  whenReady = when(() => this.ready);

  @observable initialized = false;
  @observable contextName: string;
  @observable workspace: WorkspaceId;
  @observable kubeConfigPath: string;
  @observable apiUrl: string; // cluster server url
  @observable kubeProxyUrl: string; // lens-proxy to kube-api url
  @observable enabled = false; // only enabled clusters are visible to users
  @observable online = false; // describes if we can detect that cluster is online
  @observable accessible = false; // if user is able to access cluster resources
  @observable ready = false; // cluster is in usable state
  @observable reconnecting = false;
  @observable disconnected = true; // false if user has selected to connect
  @observable failureReason: string;
  @observable isAdmin = false;
  @observable eventCount = 0;
  @observable preferences: ClusterPreferences = {};
  @observable metadata: ClusterMetadata = {};
  @observable allowedNamespaces: string[] = [];
  @observable allowedResources: string[] = [];
  @observable accessibleNamespaces: string[] = [];

  @computed get available() {
    return this.accessible && !this.disconnected;
  }

  get version(): string {
    return String(this.metadata?.version) || ""
  }

  constructor(model: ClusterModel) {
    this.updateModel(model);
    const kubeconfig = this.getKubeconfig()
    if (kubeconfig.getContextObject(this.contextName)) {
      this.apiUrl = kubeconfig.getCluster(kubeconfig.getContextObject(this.contextName).cluster).server
    }
  }

  get isManaged(): boolean {
    return !!this.ownerRef
  }

  @action
  updateModel(model: ClusterModel) {
    Object.assign(this, model);
  }

  @action
  async init(port: number) {
    try {
      this.contextHandler = new ContextHandler(this);
      this.kubeconfigManager = await KubeconfigManager.create(this, this.contextHandler, port);
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
    logger.info(`[CLUSTER]: bind events`, this.getMeta())
    const refreshTimer = setInterval(() => !this.disconnected && this.refresh(), 30000) // every 30s
    const refreshMetadataTimer = setInterval(() => !this.disconnected && this.refreshMetadata(), 900000) // every 15 minutes

    if (ipcMain) {
      this.eventDisposers.push(
        reaction(() => this.getState(), () => this.pushState()),
        () => {
          clearInterval(refreshTimer)
          clearInterval(refreshMetadataTimer)
        },
      );
    }
  }

  protected unbindEvents() {
    logger.info(`[CLUSTER]: unbind events`, this.getMeta());
    this.eventDisposers.forEach(dispose => dispose());
    this.eventDisposers.length = 0;
  }

  @action
  async activate(force = false) {
    if (this.activated && !force) {
      return this.pushState();
    }
    logger.info(`[CLUSTER]: activate`, this.getMeta());
    await this.whenInitialized;
    if (!this.eventDisposers.length) {
      this.bindEvents();
    }
    if (this.disconnected || !this.accessible) {
      await this.reconnect();
    }
    await this.refreshConnectionStatus()
    if (this.accessible) {
      await this.refreshAllowedResources()
      this.isAdmin = await this.isClusterAdmin()
      this.ready = true
      this.kubeCtl = new Kubectl(this.version)
      this.kubeCtl.ensureKubectl() // download kubectl in background, so it's not blocking dashboard
    }
    this.activated = true
    return this.pushState();
  }

  @action
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
    this.ready = false;
    this.activated = false;
    this.pushState();
  }

  @action
  async refresh(opts: ClusterRefreshOptions = {}) {
    logger.info(`[CLUSTER]: refresh`, this.getMeta());
    await this.whenInitialized;
    await this.refreshConnectionStatus();
    if (this.accessible) {
      this.isAdmin = await this.isClusterAdmin();
      await Promise.all([
        this.refreshEvents(),
        this.refreshAllowedResources(),
      ]);
      if (opts.refreshMetadata) {
        this.refreshMetadata()
      }
      this.ready = true
    }
    this.pushState();
  }

  @action
  async refreshMetadata() {
    logger.info(`[CLUSTER]: refreshMetadata`, this.getMeta());
    const metadata = await detectorRegistry.detectForCluster(this)
    const existingMetadata = this.metadata
    this.metadata = Object.assign(existingMetadata, metadata)
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

  protected async k8sRequest<T = any>(path: string, options: RequestPromiseOptions = {}): Promise<T> {
    const apiUrl = this.kubeProxyUrl + path;
    return request(apiUrl, {
      json: true,
      timeout: 30000,
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
      const versionDetector = new VersionDetector(this)
      const versionData = await versionDetector.detect()
      this.metadata.version = versionData.value
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
            const { body: pod } = await client.readNamespacedPod(w.involvedObject.name, w.involvedObject.namespace);
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
      const nodes = (await client.listNode()).body.items;
      const nodeNotificationCount = nodes
        .map(getNodeWarningConditions)
        .reduce((sum, conditions) => sum + conditions.length, 0);
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
      metadata: this.metadata,
      ownerRef: this.ownerRef,
      accessibleNamespaces: this.accessibleNamespaces,
    };
    return toJS(model, {
      recurseEverything: true
    })
  }

  // serializable cluster-state used for sync btw main <-> renderer
  getState(): ClusterState {
    const state: ClusterState = {
      initialized: this.initialized,
      apiUrl: this.apiUrl,
      online: this.online,
      ready: this.ready,
      disconnected: this.disconnected,
      accessible: this.accessible,
      failureReason: this.failureReason,
      isAdmin: this.isAdmin,
      eventCount: this.eventCount,
      allowedNamespaces: this.allowedNamespaces,
      allowedResources: this.allowedResources,
    };
    return toJS(state, {
      recurseEverything: true
    })
  }

  @action
  setState(state: ClusterState) {
    Object.assign(this, state)
  }

  pushState(state = this.getState()) {
    logger.silly(`[CLUSTER]: push-state`, state);
    broadcastIpc({
      channel: "cluster:state",
      frameId: this.frameId,
      args: [this.id, state],
    })
  }

  // get cluster system meta, e.g. use in "logger"
  getMeta() {
    return {
      id: this.id,
      name: this.contextName,
      initialized: this.initialized,
      ready: this.ready,
      online: this.online,
      accessible: this.accessible,
      disconnected: this.disconnected,
    }
  }

  protected async getAllowedNamespaces() {
    if (this.accessibleNamespaces.length) {
      return this.accessibleNamespaces
    }

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
      return [];
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

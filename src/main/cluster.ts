import { ipcMain } from "electron";
import type { ClusterId, ClusterMetadata, ClusterModel, ClusterPreferences, ClusterPrometheusPreferences } from "../common/cluster-store";
import type { IMetricsReqParams } from "../renderer/api/endpoints/metrics.api";
import type { WorkspaceId } from "../common/workspace-store";
import { action, comparer, computed, observable, reaction, toJS, when } from "mobx";
import { apiKubePrefix } from "../common/vars";
import { broadcastMessage, InvalidKubeconfigChannel } from "../common/ipc";
import { ContextHandler } from "./context-handler";
import { AuthorizationV1Api, CoreV1Api, KubeConfig, V1ResourceAttributes } from "@kubernetes/client-node";
import { Kubectl } from "./kubectl";
import { KubeconfigManager } from "./kubeconfig-manager";
import { loadConfig, validateKubeConfig } from "../common/kube-helpers";
import request, { RequestPromiseOptions } from "request-promise-native";
import { apiResources, KubeApiResource } from "../common/rbac";
import logger from "./logger";
import { VersionDetector } from "./cluster-detectors/version-detector";
import { detectorRegistry } from "./cluster-detectors/detector-registry";
import plimit from "p-limit";

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
  LAST_SEEN = "lastSeen",
  PROMETHEUS = "prometheus"
}

export type ClusterRefreshOptions = {
  refreshMetadata?: boolean
};

export interface ClusterState {
  initialized: boolean;
  enabled: boolean;
  apiUrl: string;
  online: boolean;
  disconnected: boolean;
  accessible: boolean;
  ready: boolean;
  failureReason: string;
  isAdmin: boolean;
  allowedNamespaces: string[]
  allowedResources: string[]
  isGlobalWatchEnabled: boolean;
}

/**
 * Cluster
 *
 * @beta
 */
export class Cluster implements ClusterModel, ClusterState {
  /** Unique id for a cluster */
  public id: ClusterId;
  /**
   * Kubectl
   *
   * @internal
   */
  public kubeCtl: Kubectl;
  /**
   * Context handler
   *
   * @internal
   */
  public contextHandler: ContextHandler;
  /**
   * Owner reference
   *
   * If extension sets this it needs to also mark cluster as enabled on activate (or when added to a store)
   */
  public ownerRef: string;
  protected kubeconfigManager: KubeconfigManager;
  protected eventDisposers: Function[] = [];
  protected activated = false;
  private resourceAccessStatuses: Map<KubeApiResource, boolean> = new Map();

  whenInitialized = when(() => this.initialized);
  whenReady = when(() => this.ready);

  /**
   * Is cluster object initializinng on-going
   *
   * @observable
   */
  @observable initializing = false;

  /**
   * Is cluster object initialized
   *
   * @observable
   */
  @observable initialized = false;
  /**
   * Kubeconfig context name
   *
   * @observable
   */
  @observable contextName: string;
  /**
   * Workspace id
   *
   * @observable
   */
  @observable workspace: WorkspaceId;
  /**
   * Path to kubeconfig
   *
   * @observable
   */
  @observable kubeConfigPath: string;
  /**
   * Kubernetes API server URL
   *
   * @observable
   */
  @observable apiUrl: string; // cluster server url
  /**
   * Internal authentication proxy URL
   *
   * @observable
   * @internal
   */
  @observable kubeProxyUrl: string; // lens-proxy to kube-api url
  /**
   * Is cluster instance enabled (disabled clusters are currently hidden)
   *
   * @observable
   */
  @observable enabled = false; // only enabled clusters are visible to users
  /**
   * Is cluster online
   *
   * @observable
   */
  @observable online = false; // describes if we can detect that cluster is online
  /**
   * Can user access cluster resources
   *
   * @observable
   */
  @observable accessible = false; // if user is able to access cluster resources
  /**
   * Is cluster instance in usable state
   *
   * @observable
   */
  @observable ready = false; // cluster is in usable state
  /**
   * Is cluster currently reconnecting
   *
   * @observable
   */
  @observable reconnecting = false;
  /**
   * Is cluster disconnected. False if user has selected to connect.
   *
   * @observable
   */
  @observable disconnected = true;
  /**
   * Connection failure reason
   *
   * @observable
   */
  @observable failureReason: string;
  /**
   * Does user have admin like access
   *
   * @observable
   */
  @observable isAdmin = false;

  /**
   * Global watch-api accessibility , e.g. "/api/v1/services?watch=1"
   *
   * @observable
   */
  @observable isGlobalWatchEnabled = false;
  /**
   * Preferences
   *
   * @observable
   */
  @observable preferences: ClusterPreferences = {};
  /**
   * Metadata
   *
   * @observable
   */
  @observable metadata: ClusterMetadata = {};
  /**
   * List of allowed namespaces verified via K8S::SelfSubjectAccessReview api
   *
   * @observable
   */
  @observable allowedNamespaces: string[] = [];
  /**
   * List of allowed resources
   *
   * @observable
   * @internal
   */
  @observable allowedResources: string[] = [];
  /**
   * List of accessible namespaces provided by user in the Cluster Settings
   *
   * @observable
   */
  @observable accessibleNamespaces: string[] = [];

  /**
   * Is cluster available
   *
   * @computed
   */
  @computed get available() {
    return this.accessible && !this.disconnected;
  }

  /**
   * Cluster name
   *
   * @computed
   */
  @computed get name() {
    return this.preferences.clusterName || this.contextName;
  }

  /**
   * Prometheus preferences
   *
   * @computed
   * @internal
   */
  @computed get prometheusPreferences(): ClusterPrometheusPreferences {
    const { prometheus, prometheusProvider } = this.preferences;

    return toJS({ prometheus, prometheusProvider }, {
      recurseEverything: true,
    });
  }

  /**
   * Kubernetes version
   */
  get version(): string {
    return String(this.metadata?.version ?? "");
  }

  constructor(model: ClusterModel) {
    this.updateModel(model);

    try {
      const kubeconfig = this.getKubeconfig();

      validateKubeConfig(kubeconfig, this.contextName, { validateCluster: true, validateUser: false, validateExec: false});
      this.apiUrl = kubeconfig.getCluster(kubeconfig.getContextObject(this.contextName).cluster).server;
    } catch(err) {
      logger.error(err);
      logger.error(`[CLUSTER] Failed to load kubeconfig for the cluster '${this.name || this.contextName}' (context: ${this.contextName}, kubeconfig: ${this.kubeConfigPath}).`);
      broadcastMessage(InvalidKubeconfigChannel, model.id);
    }
  }

  /**
   * Is cluster managed by an extension
   */
  get isManaged(): boolean {
    return !!this.ownerRef;
  }

  /**
   * Update cluster data model
   *
   * @param model
   */
  @action updateModel(model: ClusterModel) {
    Object.assign(this, model);
  }

  /**
   * Initialize a cluster (can be done only in main process)
   *
   * @param port port where internal auth proxy is listening
   * @internal
   */
  @action
  async init(port: number) {
    try {
      this.initializing = true;
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
    } finally {
      this.initializing = false;
    }
  }

  /**
   * @internal
   */
  protected bindEvents() {
    logger.info(`[CLUSTER]: bind events`, this.getMeta());
    const refreshTimer = setInterval(() => !this.disconnected && this.refresh(), 30000); // every 30s
    const refreshMetadataTimer = setInterval(() => !this.disconnected && this.refreshMetadata(), 900000); // every 15 minutes

    if (ipcMain) {
      this.eventDisposers.push(
        reaction(() => this.getState(), () => this.pushState()),
        reaction(() => this.prometheusPreferences, (prefs) => this.contextHandler.setupPrometheus(prefs), { equals: comparer.structural, }),
        () => {
          clearInterval(refreshTimer);
          clearInterval(refreshMetadataTimer);
        },
      );
    }
  }

  /**
   * internal
   */
  protected unbindEvents() {
    logger.info(`[CLUSTER]: unbind events`, this.getMeta());
    this.eventDisposers.forEach(dispose => dispose());
    this.eventDisposers.length = 0;
  }

  /**
   * @param force force activation
   * @internal
   */
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
    await this.refreshConnectionStatus();

    if (this.accessible) {
      await this.refreshAccessibility();
      this.ensureKubectl();
    }
    this.activated = true;

    return this.pushState();
  }

  /**
   * @internal
   */
  protected async ensureKubectl() {
    this.kubeCtl = new Kubectl(this.version);

    return this.kubeCtl.ensureKubectl(); // download kubectl in background, so it's not blocking dashboard
  }

  /**
   * @internal
   */
  @action
  async reconnect() {
    logger.info(`[CLUSTER]: reconnect`, this.getMeta());
    this.contextHandler?.stopServer();
    await this.contextHandler?.ensureServer();
    this.disconnected = false;
  }

  /**
   * @internal
   */
  @action disconnect() {
    logger.info(`[CLUSTER]: disconnect`, this.getMeta());
    this.unbindEvents();
    this.contextHandler?.stopServer();
    this.disconnected = true;
    this.online = false;
    this.accessible = false;
    this.ready = false;
    this.activated = false;
    this.allowedNamespaces = [];
    this.resourceAccessStatuses.clear();
    this.pushState();
  }

  /**
   * @internal
   * @param opts refresh options
   */
  @action
  async refresh(opts: ClusterRefreshOptions = {}) {
    logger.info(`[CLUSTER]: refresh`, this.getMeta());
    await this.whenInitialized;
    await this.refreshConnectionStatus();

    if (this.accessible) {
      await this.refreshAccessibility();

      if (opts.refreshMetadata) {
        this.refreshMetadata();
      }
    }
    this.pushState();
  }

  /**
   * @internal
   */
  @action
  async refreshMetadata() {
    logger.info(`[CLUSTER]: refreshMetadata`, this.getMeta());
    const metadata = await detectorRegistry.detectForCluster(this);
    const existingMetadata = this.metadata;

    this.metadata = Object.assign(existingMetadata, metadata);
  }

  /**
   * @internal
   */
  private async refreshAccessibility(): Promise<void> {
    this.isAdmin = await this.isClusterAdmin();
    this.isGlobalWatchEnabled = await this.canUseWatchApi({ resource: "*" });

    await this.refreshAllowedResources();

    this.ready = true;
  }

  /**
   * @internal
   */
  @action
  async refreshConnectionStatus() {
    const connectionStatus = await this.getConnectionStatus();

    this.online = connectionStatus > ClusterStatus.Offline;
    this.accessible = connectionStatus == ClusterStatus.AccessGranted;
  }

  /**
   * @internal
   */
  @action
  async refreshAllowedResources() {
    this.allowedNamespaces = await this.getAllowedNamespaces();
    this.allowedResources = await this.getAllowedResources();
  }

  protected getKubeconfig(): KubeConfig {
    return loadConfig(this.kubeConfigPath);
  }

  /**
   * @internal
   */
  getProxyKubeconfig(): KubeConfig {
    return loadConfig(this.getProxyKubeconfigPath());
  }

  /**
   * @internal
   */
  getProxyKubeconfigPath(): string {
    return this.kubeconfigManager.getPath();
  }

  protected async k8sRequest<T = any>(path: string, options: RequestPromiseOptions = {}): Promise<T> {
    options.headers ??= {};
    options.json ??= true;
    options.timeout ??= 30000;
    options.headers.Host = `${this.id}.${new URL(this.kubeProxyUrl).host}`; // required in ClusterManager.getClusterForRequest()

    return request(this.kubeProxyUrl + path, options);
  }

  /**
   *
   * @param prometheusPath path to prometheus service
   * @param queryParams query parameters
   * @internal
   */
  getMetrics(prometheusPath: string, queryParams: IMetricsReqParams & { query: string }) {
    const prometheusPrefix = this.preferences.prometheus?.prefix || "";
    const metricsPath = `/api/v1/namespaces/${prometheusPath}/proxy${prometheusPrefix}/api/v1/query_range`;

    return this.k8sRequest(metricsPath, {
      timeout: 0,
      resolveWithFullResponse: false,
      json: true,
      qs: queryParams,
    });
  }

  protected async getConnectionStatus(): Promise<ClusterStatus> {
    try {
      const versionDetector = new VersionDetector(this);
      const versionData = await versionDetector.detect();

      this.metadata.version = versionData.value;

      this.failureReason = null;

      return ClusterStatus.AccessGranted;
    } catch (error) {
      logger.error(`Failed to connect cluster "${this.contextName}": ${error}`);

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

  /**
   * @internal
   * @param resourceAttributes resource attributes
   */
  async canI(resourceAttributes: V1ResourceAttributes): Promise<boolean> {
    const authApi = this.getProxyKubeconfig().makeApiClient(AuthorizationV1Api);

    try {
      const accessReview = await authApi.createSelfSubjectAccessReview({
        apiVersion: "authorization.k8s.io/v1",
        kind: "SelfSubjectAccessReview",
        spec: { resourceAttributes }
      });

      return accessReview.body.status.allowed;
    } catch (error) {
      logger.error(`failed to request selfSubjectAccessReview: ${error}`);

      return false;
    }
  }

  /**
   * @internal
   */
  async isClusterAdmin(): Promise<boolean> {
    return this.canI({
      namespace: "kube-system",
      resource: "*",
      verb: "create",
    });
  }

  /**
   * @internal
   */
  async canUseWatchApi(customizeResource: V1ResourceAttributes = {}): Promise<boolean> {
    return this.canI({
      verb: "watch",
      resource: "*",
      ...customizeResource,
    });
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
    });
  }

  /**
   * Serializable cluster-state used for sync btw main <-> renderer
   */
  getState(): ClusterState {
    const state: ClusterState = {
      initialized: this.initialized,
      enabled: this.enabled,
      apiUrl: this.apiUrl,
      online: this.online,
      ready: this.ready,
      disconnected: this.disconnected,
      accessible: this.accessible,
      failureReason: this.failureReason,
      isAdmin: this.isAdmin,
      allowedNamespaces: this.allowedNamespaces,
      allowedResources: this.allowedResources,
      isGlobalWatchEnabled: this.isGlobalWatchEnabled,
    };

    return toJS(state, {
      recurseEverything: true
    });
  }

  /**
   * @internal
   * @param state cluster state
   */
  @action setState(state: ClusterState) {
    Object.assign(this, state);
  }

  /**
   * @internal
   * @param state cluster state
   */
  pushState(state = this.getState()) {
    logger.silly(`[CLUSTER]: push-state`, state);
    broadcastMessage("cluster:state", this.id, state);
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
    };
  }

  protected async getAllowedNamespaces() {
    if (this.accessibleNamespaces.length) {
      return this.accessibleNamespaces;
    }

    const api = this.getProxyKubeconfig().makeApiClient(CoreV1Api);

    try {
      const namespaceList = await api.listNamespace();

      return namespaceList.body.items.map(ns => ns.metadata.name);
    } catch (error) {
      const ctx = this.getProxyKubeconfig().getContextObject(this.contextName);

      if (ctx.namespace) return [ctx.namespace];

      return [];
    }
  }

  protected async getAllowedResources() {
    try {
      if (!this.allowedNamespaces.length) {
        return [];
      }
      const resources = apiResources.filter((resource) => this.resourceAccessStatuses.get(resource) === undefined);
      const apiLimit = plimit(5); // 5 concurrent api requests
      const requests = [];

      for (const apiResource of resources) {
        requests.push(apiLimit(async () => {
          for (const namespace of this.allowedNamespaces.slice(0, 10)) {
            if (!this.resourceAccessStatuses.get(apiResource)) {
              const result = await this.canI({
                resource: apiResource.apiName,
                group: apiResource.group,
                verb: "list",
                namespace
              });

              this.resourceAccessStatuses.set(apiResource, result);
            }
          }
        }));
      }
      await Promise.all(requests);

      return apiResources
        .filter((resource) => this.resourceAccessStatuses.get(resource))
        .map(apiResource => apiResource.apiName);
    } catch (error) {
      return [];
    }
  }

  isAllowedResource(kind: string): boolean {
    const apiResource = apiResources.find(resource => resource.kind === kind || resource.apiName === kind);

    if (apiResource) {
      return this.allowedResources.includes(apiResource.apiName);
    }

    return true; // allowed by default for other resources
  }
}

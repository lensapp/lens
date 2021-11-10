/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { ipcMain } from "electron";
import { action, comparer, computed, makeObservable, observable, reaction, when } from "mobx";
import { broadcastMessage, ClusterListNamespaceForbiddenChannel } from "../common/ipc";
import { ContextHandler } from "./context-handler";
import { AuthorizationV1Api, CoreV1Api, HttpError, KubeConfig, V1ResourceAttributes } from "@kubernetes/client-node";
import { Kubectl } from "./kubectl";
import { KubeconfigManager } from "./kubeconfig-manager";
import { loadConfigFromFile, loadConfigFromFileSync, validateKubeConfig } from "../common/kube-helpers";
import { apiResourceRecord, apiResources, KubeApiResource, KubeResource } from "../common/rbac";
import logger from "../common/logger";
import { VersionDetector } from "./cluster-detectors/version-detector";
import { DetectorRegistry } from "./cluster-detectors/detector-registry";
import plimit from "p-limit";
import type { ClusterState, ClusterRefreshOptions, ClusterMetricsResourceType, ClusterId, ClusterMetadata, ClusterModel, ClusterPreferences, ClusterPrometheusPreferences, UpdateClusterModel, KubeAuthUpdate } from "../common/cluster-types";
import { ClusterMetadataKey, initialNodeShellImage, ClusterStatus } from "../common/cluster-types";
import { disposer, storedKubeConfigFolder, toJS } from "../common/utils";
import type { Response } from "request";

/**
 * Cluster
 *
 * @beta
 */
export class Cluster implements ClusterModel, ClusterState {
  /** Unique id for a cluster */
  public readonly id: ClusterId;
  private kubeCtl: Kubectl;
  /**
   * Context handler
   *
   * @internal
   */
  public contextHandler: ContextHandler;
  protected proxyKubeconfigManager: KubeconfigManager;
  protected eventsDisposer = disposer();
  protected activated = false;
  private resourceAccessStatuses: Map<KubeApiResource, boolean> = new Map();

  get whenReady() {
    return when(() => this.ready);
  }

  /**
   * Kubeconfig context name
   *
   * @observable
   */
  @observable contextName: string;
  /**
   * Path to kubeconfig
   *
   * @observable
   */
  @observable kubeConfigPath: string;
  /**
   * @deprecated
   */
  @observable workspace: string;
  /**
   * @deprecated
   */
  @observable workspaces: string[];
  /**
   * Kubernetes API server URL
   *
   * @observable
   */
  @observable apiUrl: string; // cluster server url
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
   * Labels for the catalog entity
   */
  @observable labels: Record<string, string> = {};

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
   * The detected kubernetes distribution
   */
  @computed get distribution(): string {
    return this.metadata[ClusterMetadataKey.DISTRIBUTION]?.toString() || "unknown";
  }

  /**
   * The detected kubernetes version
   */
  @computed get version(): string {
    return this.metadata[ClusterMetadataKey.VERSION]?.toString() || "unknown";
  }

  /**
   * Prometheus preferences
   *
   * @computed
   * @internal
   */
  @computed get prometheusPreferences(): ClusterPrometheusPreferences {
    const { prometheus, prometheusProvider } = this.preferences;

    return toJS({ prometheus, prometheusProvider });
  }

  /**
   * defaultNamespace preference
   *
   * @computed
   * @internal
   */
  @computed get defaultNamespace(): string {
    return this.preferences.defaultNamespace;
  }

  constructor(model: ClusterModel) {
    makeObservable(this);
    this.id = model.id;
    this.updateModel(model);

    const { config } = loadConfigFromFileSync(this.kubeConfigPath);
    const validationError = validateKubeConfig(config, this.contextName);

    if (validationError) {
      throw validationError;
    }

    this.apiUrl = config.getCluster(config.getContextObject(this.contextName).cluster).server;

    if (ipcMain) {
      // for the time being, until renderer gets its own cluster type
      this.contextHandler = new ContextHandler(this);
      this.proxyKubeconfigManager = new KubeconfigManager(this, this.contextHandler);

      logger.debug(`[CLUSTER]: Cluster init success`, {
        id: this.id,
        context: this.contextName,
        apiUrl: this.apiUrl,
      });
    }
  }

  /**
   * Update cluster data model
   *
   * @param model
   */
  @action updateModel(model: UpdateClusterModel) {
    // Note: do not assign ID as that should never be updated

    this.kubeConfigPath = model.kubeConfigPath;

    if (model.workspace) {
      this.workspace = model.workspace;
    }

    if (model.workspaces) {
      this.workspaces = model.workspaces;
    }

    if (model.contextName) {
      this.contextName = model.contextName;
    }

    if (model.preferences) {
      this.preferences = model.preferences;
    }

    if (model.metadata) {
      this.metadata = model.metadata;
    }

    if (model.accessibleNamespaces) {
      this.accessibleNamespaces = model.accessibleNamespaces;
    }

    if (model.labels) {
      this.labels = model.labels;
    }
  }

  /**
   * @internal
   */
  protected bindEvents() {
    logger.info(`[CLUSTER]: bind events`, this.getMeta());
    const refreshTimer = setInterval(() => !this.disconnected && this.refresh(), 30000); // every 30s
    const refreshMetadataTimer = setInterval(() => !this.disconnected && this.refreshMetadata(), 900000); // every 15 minutes

    this.eventsDisposer.push(
      reaction(() => this.getState(), state => this.pushState(state)),
      reaction(
        () => this.prometheusPreferences,
        prefs => this.contextHandler.setupPrometheus(prefs),
        { equals: comparer.structural },
      ),
      () => clearInterval(refreshTimer),
      () => clearInterval(refreshMetadataTimer),
      reaction(() => this.defaultNamespace, () => this.recreateProxyKubeconfig()),
    );
  }

  /**
   * @internal
   */
  protected async recreateProxyKubeconfig() {
    logger.info("[CLUSTER]: Recreating proxy kubeconfig");

    try {
      await this.proxyKubeconfigManager.clear();
      await this.getProxyKubeconfig();
    } catch (error) {
      logger.error(`[CLUSTER]: failed to recreate proxy kubeconfig`, error);
    }
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

    if (!this.eventsDisposer.length) {
      this.bindEvents();
    }

    if (this.disconnected || !this.accessible) {
      await this.reconnect();
    }

    this.broadcastConnectUpdate("Refreshing connection status ...");
    await this.refreshConnectionStatus();

    if (this.accessible) {
      this.broadcastConnectUpdate("Refreshing cluster accessibility ...");
      await this.refreshAccessibility();
      // download kubectl in background, so it's not blocking dashboard
      this.ensureKubectl()
        .catch(error => logger.warn(`[CLUSTER]: failed to download kubectl for clusterId=${this.id}`, error));
      this.broadcastConnectUpdate("Connected, waiting for view to load ...");
    }

    this.activated = true;
    this.pushState();
  }

  /**
   * @internal
   */
  async ensureKubectl() {
    this.kubeCtl ??= new Kubectl(this.version);

    await this.kubeCtl.ensureKubectl();

    return this.kubeCtl;
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
    logger.info(`[CLUSTER]: disconnecting`, { id: this.id });
    this.eventsDisposer();
    this.contextHandler?.stopServer();
    this.disconnected = true;
    this.online = false;
    this.accessible = false;
    this.ready = false;
    this.activated = false;
    this.allowedNamespaces = [];
    this.resourceAccessStatuses.clear();
    this.pushState();
    logger.info(`[CLUSTER]: disconnected`, { id: this.id });
  }

  /**
   * @internal
   * @param opts refresh options
   */
  @action
  async refresh(opts: ClusterRefreshOptions = {}) {
    logger.info(`[CLUSTER]: refresh`, this.getMeta());
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
    const metadata = await DetectorRegistry.getInstance().detectForCluster(this);
    const existingMetadata = this.metadata;

    this.metadata = Object.assign(existingMetadata, metadata);
  }

  /**
   * @internal
   */
  private async refreshAccessibility(): Promise<void> {
    this.isAdmin = await this.isClusterAdmin();
    this.isGlobalWatchEnabled = await this.canUseWatchApi({ resource: "*" });
    this.allowedNamespaces = await this.getAllowedNamespaces();
    this.allowedResources = await this.getAllowedResources();
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

  async getKubeconfig(): Promise<KubeConfig> {
    const { config } = await loadConfigFromFile(this.kubeConfigPath);

    return config;
  }

  /**
   * @internal
   */
  async getProxyKubeconfig(): Promise<KubeConfig> {
    const proxyKCPath = await this.getProxyKubeconfigPath();
    const { config } = await loadConfigFromFile(proxyKCPath);

    return config;
  }

  /**
   * @internal
   */
  async getProxyKubeconfigPath(): Promise<string> {
    return this.proxyKubeconfigManager.getPath();
  }

  protected async getConnectionStatus(): Promise<ClusterStatus> {
    try {
      const versionDetector = new VersionDetector(this);
      const versionData = await versionDetector.detect();

      this.metadata.version = versionData.value;

      return ClusterStatus.AccessGranted;
    } catch (error) {
      logger.error(`[CLUSTER]: Failed to connect to "${this.contextName}": ${error}`);

      if (error.statusCode) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          this.broadcastConnectUpdate("Invalid credentials", true);

          return ClusterStatus.AccessDenied;
        }

        this.broadcastConnectUpdate(error.error || error.message, true);

        return ClusterStatus.Offline;
      }

      if (error.failed === true) {
        if (error.timedOut === true) {
          this.broadcastConnectUpdate("Connection timed out", true);

          return ClusterStatus.Offline;
        }

        this.broadcastConnectUpdate("Failed to fetch credentials", true);

        return ClusterStatus.AccessDenied;
      }

      this.broadcastConnectUpdate(error.message, true);

      return ClusterStatus.Offline;
    }
  }

  /**
   * @internal
   * @param resourceAttributes resource attributes
   */
  async canI(resourceAttributes: V1ResourceAttributes): Promise<boolean> {
    const authApi = (await this.getProxyKubeconfig()).makeApiClient(AuthorizationV1Api);

    try {
      const accessReview = await authApi.createSelfSubjectAccessReview({
        apiVersion: "authorization.k8s.io/v1",
        kind: "SelfSubjectAccessReview",
        spec: { resourceAttributes },
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
    return toJS({
      id: this.id,
      contextName: this.contextName,
      kubeConfigPath: this.kubeConfigPath,
      workspace: this.workspace,
      workspaces: this.workspaces,
      preferences: this.preferences,
      metadata: this.metadata,
      accessibleNamespaces: this.accessibleNamespaces,
      labels: this.labels,
    });
  }

  /**
   * Serializable cluster-state used for sync btw main <-> renderer
   */
  getState(): ClusterState {
    return toJS({
      apiUrl: this.apiUrl,
      online: this.online,
      ready: this.ready,
      disconnected: this.disconnected,
      accessible: this.accessible,
      isAdmin: this.isAdmin,
      allowedNamespaces: this.allowedNamespaces,
      allowedResources: this.allowedResources,
      isGlobalWatchEnabled: this.isGlobalWatchEnabled,
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
      ready: this.ready,
      online: this.online,
      accessible: this.accessible,
      disconnected: this.disconnected,
    };
  }

  /**
   * broadcast an authentication update concerning this cluster
   * @internal
   */
  broadcastConnectUpdate(message: string, isError = false): void {
    const update: KubeAuthUpdate = { message, isError };

    logger.debug(`[CLUSTER]: broadcasting connection update`, { ...update, meta: this.getMeta() });
    broadcastMessage(`cluster:${this.id}:connection-update`, update);
  }

  protected async getAllowedNamespaces() {
    if (this.accessibleNamespaces.length) {
      return this.accessibleNamespaces;
    }

    const api = (await this.getProxyKubeconfig()).makeApiClient(CoreV1Api);

    try {
      const { body: { items }} = await api.listNamespace();
      const namespaces = items.map(ns => ns.metadata.name);

      return namespaces;
    } catch (error) {
      const ctx = (await this.getProxyKubeconfig()).getContextObject(this.contextName);
      const namespaceList = [ctx.namespace].filter(Boolean);

      if (namespaceList.length === 0 && error instanceof HttpError && error.statusCode === 403) {
        const { response } = error as HttpError & { response: Response };

        logger.info("[CLUSTER]: listing namespaces is forbidden, broadcasting", { clusterId: this.id, error: response.body });
        broadcastMessage(ClusterListNamespaceForbiddenChannel, this.id);
      }

      return namespaceList;
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
                namespace,
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
    if ((kind as KubeResource) in apiResourceRecord) {
      return this.allowedResources.includes(kind);
    }

    const apiResource = apiResources.find(resource => resource.kind === kind);

    if (apiResource) {
      return this.allowedResources.includes(apiResource.apiName);
    }

    return true; // allowed by default for other resources
  }

  isMetricHidden(resource: ClusterMetricsResourceType): boolean {
    return Boolean(this.preferences.hiddenMetrics?.includes(resource));
  }

  get nodeShellImage(): string {
    return this.preferences?.nodeShellImage || initialNodeShellImage;
  }

  get imagePullSecret(): string | undefined {
    return this.preferences?.imagePullSecret;
  }

  isInLocalKubeconfig() {
    return this.kubeConfigPath.startsWith(storedKubeConfigFolder());
  }
}

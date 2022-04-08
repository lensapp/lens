/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, comparer, computed, makeObservable, observable, reaction, when } from "mobx";
import { broadcastMessage } from "../ipc";
import type { ClusterContextHandler } from "../../main/context-handler/context-handler";
import type { KubeConfig } from "@kubernetes/client-node";
import { HttpError } from "@kubernetes/client-node";
import type { Kubectl } from "../../main/kubectl/kubectl";
import type { KubeconfigManager } from "../../main/kubeconfig-manager/kubeconfig-manager";
import { loadConfigFromFile, loadConfigFromFileSync, validateKubeConfig } from "../kube-helpers";
import type { KubeApiResource, KubeResource } from "../rbac";
import { apiResourceRecord, apiResources } from "../rbac";
import { VersionDetector } from "../../main/cluster-detectors/version-detector";
import { DetectorRegistry } from "../../main/cluster-detectors/detector-registry";
import plimit from "p-limit";
import type { ClusterState, ClusterRefreshOptions, ClusterMetricsResourceType, ClusterId, ClusterMetadata, ClusterModel, ClusterPreferences, ClusterPrometheusPreferences, UpdateClusterModel, KubeAuthUpdate } from "../cluster-types";
import { ClusterMetadataKey, initialNodeShellImage, ClusterStatus } from "../cluster-types";
import { disposer, isDefined, isRequestError, toJS } from "../utils";
import type { Response } from "request";
import { clusterListNamespaceForbiddenChannel } from "../ipc/cluster";
import type { CanI } from "./authorization-review.injectable";
import type { ListNamespaces } from "./list-namespaces.injectable";
import assert from "assert";
import type { Logger } from "../logger";

export interface ClusterDependencies {
  readonly directoryForKubeConfigs: string;
  readonly logger: Logger;
  createKubeconfigManager: (cluster: Cluster) => KubeconfigManager | undefined;
  createContextHandler: (cluster: Cluster) => ClusterContextHandler | undefined;
  createKubectl: (clusterVersion: string) => Kubectl;
  createAuthorizationReview: (config: KubeConfig) => CanI;
  createListNamespaces: (config: KubeConfig) => ListNamespaces;
}

/**
 * Cluster
 *
 * @beta
 */
export class Cluster implements ClusterModel, ClusterState {
  /** Unique id for a cluster */
  public readonly id: ClusterId;
  private kubeCtl: Kubectl | undefined;
  /**
   * Context handler
   *
   * @internal
   */
  protected readonly _contextHandler: ClusterContextHandler | undefined;
  protected readonly _proxyKubeconfigManager: KubeconfigManager | undefined;
  protected readonly eventsDisposer = disposer();
  protected activated = false;
  private readonly resourceAccessStatuses = new Map<KubeApiResource, boolean>();

  public get contextHandler() {
    // TODO: remove these once main/renderer are seperate classes
    assert(this._contextHandler);

    return this._contextHandler;
  }

  protected get proxyKubeconfigManager() {
    // TODO: remove these once main/renderer are seperate classes
    assert(this._proxyKubeconfigManager);

    return this._proxyKubeconfigManager;
  }

  get whenReady() {
    return when(() => this.ready);
  }

  /**
   * Kubeconfig context name
   *
   * @observable
   */
  @observable contextName!: string;
  /**
   * Path to kubeconfig
   *
   * @observable
   */
  @observable kubeConfigPath!: string;
  /**
   * @deprecated
   */
  @observable workspace?: string;
  /**
   * @deprecated
   */
  @observable workspaces?: string[];
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
  @computed get defaultNamespace(): string | undefined {
    return this.preferences.defaultNamespace;
  }

  constructor(private readonly dependencies: ClusterDependencies, model: ClusterModel) {
    makeObservable(this);
    this.id = model.id;
    this.updateModel(model);

    const { config } = loadConfigFromFileSync(this.kubeConfigPath);
    const validationError = validateKubeConfig(config, this.contextName);

    if (validationError) {
      throw validationError;
    }

    const context = config.getContextObject(this.contextName);

    assert(context);

    const cluster = config.getCluster(context.cluster);

    assert(cluster);

    this.apiUrl = cluster.server;

    // for the time being, until renderer gets its own cluster type
    this._contextHandler = this.dependencies.createContextHandler(this);
    this._proxyKubeconfigManager = this.dependencies.createKubeconfigManager(this);
    this.dependencies.logger.debug(`[CLUSTER]: Cluster init success`, {
      id: this.id,
      context: this.contextName,
      apiUrl: this.apiUrl,
    });
  }

  /**
   * Update cluster data model
   *
   * @param model
   */
  @action updateModel(model: UpdateClusterModel) {
    // Note: do not assign ID as that should never be updated

    this.kubeConfigPath = model.kubeConfigPath;
    this.contextName = model.contextName;

    if (model.workspace) {
      this.workspace = model.workspace;
    }

    if (model.workspaces) {
      this.workspaces = model.workspaces;
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
    this.dependencies.logger.info(`[CLUSTER]: bind events`, this.getMeta());
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
    this.dependencies.logger.info("[CLUSTER]: Recreating proxy kubeconfig");

    try {
      await this.proxyKubeconfigManager.clear();
      await this.getProxyKubeconfig();
    } catch (error) {
      this.dependencies.logger.error(`[CLUSTER]: failed to recreate proxy kubeconfig`, error);
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

    this.dependencies.logger.info(`[CLUSTER]: activate`, this.getMeta());

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
        .catch(error => this.dependencies.logger.warn(`[CLUSTER]: failed to download kubectl for clusterId=${this.id}`, error));
      this.broadcastConnectUpdate("Connected, waiting for view to load ...");
    }

    this.activated = true;
    this.pushState();
  }

  /**
   * @internal
   */
  async ensureKubectl() {
    this.kubeCtl ??= this.dependencies.createKubectl(this.version);

    await this.kubeCtl.ensureKubectl();

    return this.kubeCtl;
  }

  /**
   * @internal
   */
  @action
  async reconnect() {
    this.dependencies.logger.info(`[CLUSTER]: reconnect`, this.getMeta());
    await this.contextHandler?.restartServer();
    this.disconnected = false;
  }

  /**
   * @internal
   */
  @action disconnect(): void {
    if (this.disconnected) {
      return void this.dependencies.logger.debug("[CLUSTER]: already disconnected", { id: this.id });
    }

    this.dependencies.logger.info(`[CLUSTER]: disconnecting`, { id: this.id });
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
    this.dependencies.logger.info(`[CLUSTER]: disconnected`, { id: this.id });
  }

  /**
   * @internal
   * @param opts refresh options
   */
  @action
  async refresh(opts: ClusterRefreshOptions = {}) {
    this.dependencies.logger.info(`[CLUSTER]: refresh`, this.getMeta());
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
    this.dependencies.logger.info(`[CLUSTER]: refreshMetadata`, this.getMeta());
    const metadata = await DetectorRegistry.getInstance().detectForCluster(this);
    const existingMetadata = this.metadata;

    this.metadata = Object.assign(existingMetadata, metadata);
  }

  /**
   * @internal
   */
  private async refreshAccessibility(): Promise<void> {
    const proxyConfig = await this.getProxyKubeconfig();
    const canI = this.dependencies.createAuthorizationReview(proxyConfig);

    this.isAdmin = await canI({
      namespace: "kube-system",
      resource: "*",
      verb: "create",
    });
    this.isGlobalWatchEnabled = await canI({
      verb: "watch",
      resource: "*",
    });
    this.allowedNamespaces = await this.getAllowedNamespaces(proxyConfig);
    this.allowedResources = await this.getAllowedResources(canI);
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
      this.dependencies.logger.error(`[CLUSTER]: Failed to connect to "${this.contextName}": ${error}`);

      if (isRequestError(error)) {
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
      } else {
        this.broadcastConnectUpdate("Unknown error has occurred", true);
      }

      return ClusterStatus.Offline;
    }
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
    this.dependencies.logger.silly(`[CLUSTER]: push-state`, state);
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

    this.dependencies.logger.debug(`[CLUSTER]: broadcasting connection update`, { ...update, meta: this.getMeta() });
    broadcastMessage(`cluster:${this.id}:connection-update`, update);
  }

  protected async getAllowedNamespaces(proxyConfig: KubeConfig) {
    if (this.accessibleNamespaces.length) {
      return this.accessibleNamespaces;
    }

    try {
      const listNamespaces = this.dependencies.createListNamespaces(proxyConfig);

      return await listNamespaces();
    } catch (error) {
      const ctx = proxyConfig.getContextObject(this.contextName);
      const namespaceList = [ctx?.namespace].filter(isDefined);

      if (namespaceList.length === 0 && error instanceof HttpError && error.statusCode === 403) {
        const { response } = error as HttpError & { response: Response };

        this.dependencies.logger.info("[CLUSTER]: listing namespaces is forbidden, broadcasting", { clusterId: this.id, error: response.body });
        broadcastMessage(clusterListNamespaceForbiddenChannel, this.id);
      }

      return namespaceList;
    }
  }

  protected async getAllowedResources(canI: CanI) {
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
              const result = await canI({
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
    return this.kubeConfigPath.startsWith(this.dependencies.directoryForKubeConfigs);
  }
}

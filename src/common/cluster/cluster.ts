/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, comparer, computed, makeObservable, observable, reaction, when } from "mobx";
import type { ClusterContextHandler } from "../../main/context-handler/context-handler";
import type { KubeConfig } from "@kubernetes/client-node";
import { HttpError } from "@kubernetes/client-node";
import type { Kubectl } from "../../main/kubectl/kubectl";
import type { KubeconfigManager } from "../../main/kubeconfig-manager/kubeconfig-manager";
import type { KubeApiResource, KubeResource } from "../rbac";
import { apiResourceRecord, apiResources } from "../rbac";
import type { VersionDetector } from "../../main/cluster-detectors/version-detector";
import type { DetectorRegistry } from "../../main/cluster-detectors/detector-registry";
import plimit from "p-limit";
import type { ClusterState, ClusterMetricsResourceType, ClusterId, ClusterMetadata, ClusterModel, ClusterPreferences, ClusterPrometheusPreferences, UpdateClusterModel, KubeAuthUpdate, ClusterConfigData } from "../cluster-types";
import { ClusterMetadataKey, initialNodeShellImage, ClusterStatus, clusterModelIdChecker, updateClusterModelChecker } from "../cluster-types";
import { disposer, isDefined, isRequestError, toJS } from "../utils";
import type { Response } from "request";
import { clusterListNamespaceForbiddenChannel } from "../ipc/cluster";
import type { CanI } from "./authorization-review.injectable";
import type { ListNamespaces } from "./list-namespaces.injectable";
import assert from "assert";
import type { Logger } from "../logger";
import type { BroadcastMessage } from "../ipc/broadcast-message.injectable";
import type { LoadConfigfromFile } from "../kube-helpers/load-config-from-file.injectable";
import type { RequestNamespaceResources } from "./authorization-namespace-review.injectable";
import type { RequestListApiResources } from "./list-api-resources.injectable";

export interface ClusterDependencies {
  readonly directoryForKubeConfigs: string;
  readonly logger: Logger;
  readonly detectorRegistry: DetectorRegistry;
  createKubeconfigManager: (cluster: Cluster) => KubeconfigManager;
  createContextHandler: (cluster: Cluster) => ClusterContextHandler;
  createKubectl: (clusterVersion: string) => Kubectl;
  createAuthorizationReview: (config: KubeConfig) => CanI;
  createAuthorizationNamespaceReview: (config: KubeConfig) => RequestNamespaceResources;
  createListApiResources: (cluster: Cluster) => RequestListApiResources;
  createListNamespaces: (config: KubeConfig) => ListNamespaces;
  createVersionDetector: (cluster: Cluster) => VersionDetector;
  broadcastMessage: BroadcastMessage;
  loadConfigfromFile: LoadConfigfromFile;
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
    assert(this._contextHandler, "contextHandler is only defined in the main environment");

    return this._contextHandler;
  }

  protected get proxyKubeconfigManager() {
    // TODO: remove these once main/renderer are seperate classes
    assert(this._proxyKubeconfigManager, "proxyKubeconfigManager is only defined in the main environment");

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

  constructor(private readonly dependencies: ClusterDependencies, { id, ...model }: ClusterModel, configData: ClusterConfigData) {
    makeObservable(this);

    const { error } = clusterModelIdChecker.validate({ id });

    if (error) {
      throw error;
    }

    this.id = id;
    this.updateModel(model);
    this.apiUrl = configData.clusterServerUrl;

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

    const { error } = updateClusterModelChecker.validate(model, { allowUnknown: true });

    if (error) {
      throw error;
    }

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
    const refreshMetadataTimer = setInterval(() => this.available && this.refreshAccessibilityAndMetadata(), 900000); // every 15 minutes

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
      try {
        this.broadcastConnectUpdate("Starting connection ...");
        await this.reconnect();
      } catch (error) {
        this.broadcastConnectUpdate(`Failed to start connection: ${error}`, true);

        return;
      }
    }

    try {
      this.broadcastConnectUpdate("Refreshing connection status ...");
      await this.refreshConnectionStatus();
    } catch (error) {
      this.broadcastConnectUpdate(`Failed to connection status: ${error}`, true);

      return;
    }

    if (this.accessible) {
      try {
        this.broadcastConnectUpdate("Refreshing cluster accessibility ...");
        await this.refreshAccessibility();
      } catch (error) {
        this.broadcastConnectUpdate(`Failed to refresh accessibility: ${error}`, true);

        return;
      }

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
   */
  @action
  async refresh() {
    this.dependencies.logger.info(`[CLUSTER]: refresh`, this.getMeta());
    await this.refreshConnectionStatus();
    this.pushState();
  }

  /**
   * @internal
   */
   @action
  async refreshAccessibilityAndMetadata() {
    await this.refreshAccessibility();
    await this.refreshMetadata();
  }

   /**
   * @internal
   */
   async refreshMetadata() {
     this.dependencies.logger.info(`[CLUSTER]: refreshMetadata`, this.getMeta());
     const metadata = await this.dependencies.detectorRegistry.detectForCluster(this);
     const existingMetadata = this.metadata;

     this.metadata = Object.assign(existingMetadata, metadata);
   }

   /**
   * @internal
   */
   private async refreshAccessibility(): Promise<void> {
     this.dependencies.logger.info(`[CLUSTER]: refreshAccessibility`, this.getMeta());
     const proxyConfig = await this.getProxyKubeconfig();
     const canI = this.dependencies.createAuthorizationReview(proxyConfig);
     const requestNamespaceResources = this.dependencies.createAuthorizationNamespaceReview(proxyConfig);
     const listApiResources = this.dependencies.createListApiResources(this);

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
     this.allowedResources = await this.getAllowedResources(listApiResources, requestNamespaceResources);
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
    const { config } = await this.dependencies.loadConfigfromFile(this.kubeConfigPath);

    return config;
  }

  /**
   * @internal
   */
  async getProxyKubeconfig(): Promise<KubeConfig> {
    const proxyKCPath = await this.getProxyKubeconfigPath();
    const { config } = await this.dependencies.loadConfigfromFile(proxyKCPath);

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
      const versionDetector = this.dependencies.createVersionDetector(this);
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

          const message = String(error.error || error.message) || String(error);

          this.broadcastConnectUpdate(message, true);

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

        const message = String(error.error || error.message) || String(error);

        this.broadcastConnectUpdate(message, true);
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
    this.dependencies.broadcastMessage("cluster:state", this.id, state);
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
    this.dependencies.broadcastMessage(`cluster:${this.id}:connection-update`, update);
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
        this.dependencies.broadcastMessage(clusterListNamespaceForbiddenChannel, this.id);
      }

      return namespaceList;
    }
  }

  protected async getAllowedResources(listApiResources:RequestListApiResources, requestNamespaceResources: RequestNamespaceResources) {
    try {
      if (!this.allowedNamespaces.length) {
        return [];
      }

      const unknownResources = new Map<string, KubeApiResource>(apiResources.map(resource => ([resource.apiName, resource])));

      const availableResources =  await listApiResources();
      const availableResourcesNames = new Set(availableResources.map(apiResource => apiResource.apiName));

      [...unknownResources.values()].map(unknownResource => {
        if (!availableResourcesNames.has(unknownResource.apiName)) {
          this.resourceAccessStatuses.set(unknownResource, false);
          unknownResources.delete(unknownResource.apiName);
        }
      });

      if (unknownResources.size > 0) {
        const apiLimit = plimit(5); // 5 concurrent api requests

        await Promise.all(this.allowedNamespaces.map(namespace => apiLimit(async () => {
          if (unknownResources.size === 0) {
            return;
          }

          const namespaceResources = await requestNamespaceResources(namespace, availableResources);

          for (const resourceName of namespaceResources) {
            const unknownResource = unknownResources.get(resourceName);

            if (unknownResource) {
              this.resourceAccessStatuses.set(unknownResource, true);
              unknownResources.delete(resourceName);
            }
          }
        })));

        for (const forbiddenResource of unknownResources.values()) {
          this.resourceAccessStatuses.set(forbiddenResource, false);
        }
      }

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

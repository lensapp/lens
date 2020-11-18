
import { Cluster } from "./cluster"
import type { IMetricsReqParams } from "../renderer/api/endpoints/metrics.api";
import { action, reaction } from "mobx";
import { apiKubePrefix } from "../common/vars";
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


export type ClusterRefreshOptions = {
  refreshMetadata?: boolean
}

export enum ClusterStatus {
  AccessGranted = 2,
  AccessDenied = 1,
  Offline = 0
}

export class ManagedCluster {
  public cluster: Cluster
  protected activated = false;
  protected eventDisposers: Function[] = [];
  public contextHandler: ContextHandler;
  protected kubeconfigManager: KubeconfigManager;

  constructor(cluster: Cluster) {
    this.cluster = cluster
  }

  getProxyKubeconfig(): KubeConfig {
    return loadConfig(this.getProxyKubeconfigPath());
  }

  getProxyKubeconfigPath(): string {
    return this.kubeconfigManager.getPath()
  }

  @action
  async init(port: number) {
    try {
      this.contextHandler = new ContextHandler(this);
      this.kubeconfigManager = await KubeconfigManager.create(this.cluster, this.contextHandler, port);
      this.cluster.kubeProxyUrl = `http://localhost:${port}${apiKubePrefix}`;
      this.cluster.initialized = true;
      logger.info(`[CLUSTER]: "${this.cluster.contextName}" init success`, {
        id: this.cluster.id,
        context: this.cluster.contextName,
        apiUrl: this.cluster.apiUrl
      });
    } catch (err) {
      logger.error(`[CLUSTER]: init failed: ${err}`, {
        id: this.cluster.id,
        error: err,
      });
    }
  }

  protected bindEvents() {
    logger.info(`[CLUSTER]: bind events`, this.cluster.getMeta())
    const refreshTimer = setInterval(() => !this.cluster.disconnected && this.refresh(), 30000) // every 30s
    const refreshMetadataTimer = setInterval(() => !this.cluster.disconnected && this.refreshMetadata(), 900000) // every 15 minutes

    this.eventDisposers.push(
      reaction(() => this.cluster.getState(), () => this.cluster.pushState()),
      () => {
        clearInterval(refreshTimer)
        clearInterval(refreshMetadataTimer)
      },
    );
  }

  protected unbindEvents() {
    logger.info(`[CLUSTER]: unbind events`, this.cluster.getMeta());
    this.eventDisposers.forEach(dispose => dispose());
    this.eventDisposers.length = 0;
  }

  @action
  async activate(force = false) {
    if (this.activated && !force) {
      return this.cluster.pushState();
    }
    logger.info(`[CLUSTER]: activate`, this.cluster.getMeta());
    await this.cluster.whenInitialized;
    if (!this.eventDisposers.length) {
      this.bindEvents();
    }
    if (this.cluster.disconnected || !this.cluster.accessible) {
      await this.reconnect();
    }
    await this.refreshConnectionStatus()
    if (this.cluster.accessible) {
      await this.refreshAllowedResources()
      this.cluster.isAdmin = await this.isClusterAdmin()
      this.cluster.ready = true
      this.cluster.kubeCtl = new Kubectl(this.cluster.version)
      this.cluster.kubeCtl.ensureKubectl() // download kubectl in background, so it's not blocking dashboard
    }
    this.activated = true
    return this.cluster.pushState();
  }

  @action
  async reconnect() {
    logger.info(`[CLUSTER]: reconnect`, this.cluster.getMeta());
    this.contextHandler.stopServer();
    await this.contextHandler.ensureServer();
    this.cluster.disconnected = false;
  }

  @action
  disconnect() {
    logger.info(`[CLUSTER]: disconnect`, this.cluster.getMeta());
    this.unbindEvents();
    this.contextHandler.stopServer();
    this.cluster.disconnected = true;
    this.cluster.online = false;
    this.cluster.accessible = false;
    this.cluster.ready = false;
    this.activated = false;
    this.cluster.pushState();
  }

  @action
  async refresh(opts: ClusterRefreshOptions = {}) {
    logger.info(`[CLUSTER]: refresh`, this.cluster.getMeta());
    await this.cluster.whenInitialized;
    await this.refreshConnectionStatus();
    if (this.cluster.accessible) {
      this.cluster.isAdmin = await this.isClusterAdmin();
      await Promise.all([
        this.refreshEvents(),
        this.refreshAllowedResources(),
      ]);
      if (opts.refreshMetadata) {
        this.refreshMetadata()
      }
      this.cluster.ready = true
    }
    this.cluster.pushState();
  }

  @action
  async refreshMetadata() {
    logger.info(`[CLUSTER]: refreshMetadata`, this.cluster.getMeta());
    const metadata = await detectorRegistry.detectForCluster(this.cluster)
    const existingMetadata = this.cluster.metadata
    this.cluster.metadata = Object.assign(existingMetadata, metadata)
  }

  @action
  async refreshConnectionStatus() {
    const connectionStatus = await this.getConnectionStatus();
    this.cluster.online = connectionStatus > ClusterStatus.Offline;
    this.cluster.accessible = connectionStatus == ClusterStatus.AccessGranted;
  }

  @action
  async refreshAllowedResources() {
    this.cluster.allowedNamespaces = await this.getAllowedNamespaces();
    this.cluster.allowedResources = await this.getAllowedResources();
  }

  @action
  async refreshEvents() {
    this.cluster.eventCount = await this.getEventCount();
  }

  protected async k8sRequest<T = any>(path: string, options: RequestPromiseOptions = {}): Promise<T> {
    options.headers ??= {}
    options.json ??= true
    options.timeout ??= 30000
    options.headers.Host = `${this.cluster.id}.${new URL(this.cluster.kubeProxyUrl).host}` // required in ClusterManager.getClusterForRequest()

    return request(this.cluster.kubeProxyUrl + path, options)
  }

  getMetrics(prometheusPath: string, queryParams: IMetricsReqParams & { query: string }) {
    const prometheusPrefix = this.cluster.preferences.prometheus?.prefix || "";
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
      const versionDetector = new VersionDetector(this.cluster)
      const versionData = await versionDetector.detect()
      this.cluster.metadata.version = versionData.value
      return ClusterStatus.AccessGranted;
    } catch (error) {
      logger.error(`Failed to connect cluster "${this.cluster.contextName}": ${error}`)
      if (error.statusCode) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          this.cluster.failureReason = "Invalid credentials";
          return ClusterStatus.AccessDenied;
        } else {
          this.cluster.failureReason = error.error || error.message;
          return ClusterStatus.Offline;
        }
      } else if (error.failed === true) {
        if (error.timedOut === true) {
          this.cluster.failureReason = "Connection timed out";
          return ClusterStatus.Offline;
        } else {
          this.cluster.failureReason = "Failed to fetch credentials";
          return ClusterStatus.AccessDenied;
        }
      }
      this.cluster.failureReason = error.message;
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
    if (!this.cluster.isAdmin) {
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

  protected async getAllowedNamespaces() {
    if (this.cluster.accessibleNamespaces.length) {
      return this.cluster.accessibleNamespaces
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
      const ctx = this.getProxyKubeconfig().getContextObject(this.cluster.contextName)
      if (ctx.namespace) return [ctx.namespace]
      return [];
    }
  }

  protected async getAllowedResources() {
    try {
      if (!this.cluster.allowedNamespaces.length) {
        return [];
      }
      const resourceAccessStatuses = await Promise.all(
        apiResources.map(apiResource => this.canI({
          resource: apiResource.resource,
          group: apiResource.group,
          verb: "list",
          namespace: this.cluster.allowedNamespaces[0]
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

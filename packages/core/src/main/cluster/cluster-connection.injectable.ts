/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { type KubeConfig, HttpError } from "@kubernetes/client-node";
import { reaction, comparer, runInAction } from "mobx";
import { ClusterStatus } from "../../common/cluster-types";
import type { CreateListNamespaces } from "../../common/cluster/list-namespaces.injectable";
import type { BroadcastMessage } from "../../common/ipc/broadcast-message.injectable";
import { clusterListNamespaceForbiddenChannel } from "../../common/ipc/cluster";
import type { Logger } from "@k8slens/logger";
import type { KubeApiResource } from "../../common/rbac";
import { formatKubeApiResource } from "../../common/rbac";
import { disposer, isDefined, isRequestError, withConcurrencyLimit } from "@k8slens/utilities";
import type { ClusterPrometheusHandler } from "./prometheus-handler/prometheus-handler";
import type { BroadcastConnectionUpdate } from "./broadcast-connection-update.injectable";
import type { KubeAuthProxyServer } from "./kube-auth-proxy-server.injectable";
import type { LoadProxyKubeconfig } from "./load-proxy-kubeconfig.injectable";
import type { RemoveProxyKubeconfig } from "./remove-proxy-kubeconfig.injectable";
import type { RequestApiResources } from "./request-api-resources.injectable";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import broadcastConnectionUpdateInjectable from "./broadcast-connection-update.injectable";
import broadcastMessageInjectable from "../../common/ipc/broadcast-message.injectable";
import createListNamespacesInjectable from "../../common/cluster/list-namespaces.injectable";
import kubeAuthProxyServerInjectable from "./kube-auth-proxy-server.injectable";
import loadProxyKubeconfigInjectable from "./load-proxy-kubeconfig.injectable";
import { loggerInjectionToken } from "@k8slens/logger";
import prometheusHandlerInjectable from "./prometheus-handler/prometheus-handler.injectable";
import removeProxyKubeconfigInjectable from "./remove-proxy-kubeconfig.injectable";
import requestApiResourcesInjectable from "./request-api-resources.injectable";
import type { DetectClusterMetadata } from "../cluster-detectors/detect-cluster-metadata.injectable";
import type { FallibleOnlyClusterMetadataDetector } from "../cluster-detectors/token";
import clusterVersionDetectorInjectable from "../cluster-detectors/cluster-version-detector.injectable";
import detectClusterMetadataInjectable from "../cluster-detectors/detect-cluster-metadata.injectable";
import { replaceObservableObject } from "../../common/utils/replace-observable-object";
import type { CreateAuthorizationApi } from "../../common/cluster/create-authorization-api.injectable";
import type { CreateCanI } from "../../common/cluster/create-can-i.injectable";
import type { CreateRequestNamespaceListPermissions, RequestNamespaceListPermissions } from "../../common/cluster/create-request-namespace-list-permissions.injectable";
import type { Cluster } from "../../common/cluster/cluster";
import createAuthorizationApiInjectable from "../../common/cluster/create-authorization-api.injectable";
import createCanIInjectable from "../../common/cluster/create-can-i.injectable";
import createRequestNamespaceListPermissionsInjectable from "../../common/cluster/create-request-namespace-list-permissions.injectable";
import type { CreateCoreApi } from "../../common/cluster/create-core-api.injectable";
import createCoreApiInjectable from "../../common/cluster/create-core-api.injectable";

interface Dependencies {
  readonly logger: Logger;
  readonly prometheusHandler: ClusterPrometheusHandler;
  readonly kubeAuthProxyServer: KubeAuthProxyServer;
  readonly clusterVersionDetector: FallibleOnlyClusterMetadataDetector;
  createCanI: CreateCanI;
  requestApiResources: RequestApiResources;
  createRequestNamespaceListPermissions: CreateRequestNamespaceListPermissions;
  createAuthorizationApi: CreateAuthorizationApi;
  createCoreApi: CreateCoreApi;
  createListNamespaces: CreateListNamespaces;
  detectClusterMetadata: DetectClusterMetadata;
  broadcastMessage: BroadcastMessage;
  broadcastConnectionUpdate: BroadcastConnectionUpdate;
  loadProxyKubeconfig: LoadProxyKubeconfig;
  removeProxyKubeconfig: RemoveProxyKubeconfig;
}

export type { ClusterConnection };

class ClusterConnection {
  protected readonly eventsDisposer = disposer();

  protected activated = false;

  constructor(
    private readonly dependencies: Dependencies,
    private readonly cluster: Cluster,
  ) {}

  private bindEvents() {
    this.dependencies.logger.info(`[CLUSTER]: bind events`, this.cluster.getMeta());
    const refreshTimer = setInterval(() => {
      if (!this.cluster.disconnected.get()) {
        this.refresh();
      }
    }, 30_000); // every 30s
    const refreshMetadataTimer = setInterval(() => {
      if (this.cluster.available.get()) {
        this.refreshAccessibilityAndMetadata();
      }
    }, 900000); // every 15 minutes

    this.eventsDisposer.push(
      reaction(
        () => this.cluster.prometheusPreferences.get(),
        preferences => this.dependencies.prometheusHandler.setupPrometheus(preferences),
        { equals: comparer.structural },
      ),
      () => clearInterval(refreshTimer),
      () => clearInterval(refreshMetadataTimer),
      reaction(() => this.cluster.preferences.defaultNamespace, () => this.recreateProxyKubeconfig()),
    );
  }

  protected async recreateProxyKubeconfig() {
    this.dependencies.logger.info("[CLUSTER]: Recreating proxy kubeconfig");

    try {
      await this.dependencies.removeProxyKubeconfig();
      await this.dependencies.loadProxyKubeconfig();
    } catch (error) {
      this.dependencies.logger.error(`[CLUSTER]: failed to recreate proxy kubeconfig`, error);
    }
  }

  /**
   * @param force force activation
   */
  async activate(force = false) {
    if (this.activated && !force) {
      return;
    }

    this.dependencies.logger.info(`[CLUSTER]: activate`, this.cluster.getMeta());

    if (!this.eventsDisposer.length) {
      this.bindEvents();
    }

    if (this.cluster.disconnected.get() || !this.cluster.accessible.get()) {
      try {
        this.dependencies.broadcastConnectionUpdate({
          level: "info",
          message: "Starting connection ...",
        });
        await this.reconnect();
      } catch (error) {
        this.dependencies.broadcastConnectionUpdate({
          level: "error",
          message: `Failed to start connection: ${error}`,
        });

        return;
      }
    }

    try {
      this.dependencies.broadcastConnectionUpdate({
        level: "info",
        message: "Refreshing connection status ...",
      });
      await this.refreshConnectionStatus();
    } catch (error) {
      this.dependencies.broadcastConnectionUpdate({
        level: "error",
        message: `Failed to connection status: ${error}`,
      });

      return;
    }

    if (this.cluster.accessible.get()) {
      try {
        this.dependencies.broadcastConnectionUpdate({
          level: "info",
          message: "Refreshing cluster accessibility ...",
        });
        await this.refreshAccessibility();
      } catch (error) {
        this.dependencies.broadcastConnectionUpdate({
          level: "error",
          message: `Failed to refresh accessibility: ${error}`,
        });

        return;
      }
      this.dependencies.broadcastConnectionUpdate({
        level: "info",
        message: "Connected, waiting for view to load ...",
      });
    }

    this.activated = true;
  }

  async reconnect() {
    this.dependencies.logger.info(`[CLUSTER]: reconnect`, this.cluster.getMeta());
    await this.dependencies.kubeAuthProxyServer?.restart();

    runInAction(() => {
      this.cluster.disconnected.set(false);
    });
  }

  disconnect() {
    if (this.cluster.disconnected.get()) {
      return this.dependencies.logger.debug("[CLUSTER]: already disconnected", { id: this.cluster.id });
    }

    runInAction(() => {
      this.dependencies.logger.info(`[CLUSTER]: disconnecting`, { id: this.cluster.id });
      this.eventsDisposer();
      this.dependencies.kubeAuthProxyServer?.stop();
      this.cluster.disconnected.set(true);
      this.cluster.online.set(false);
      this.cluster.accessible.set(false);
      this.cluster.ready.set(false);
      this.activated = false;
      this.cluster.allowedNamespaces.clear();
      this.dependencies.logger.info(`[CLUSTER]: disconnected`, { id: this.cluster.id });
    });
  }

  async refresh() {
    this.dependencies.logger.info(`[CLUSTER]: refresh`, this.cluster.getMeta());
    await this.refreshConnectionStatus();
  }

  async refreshAccessibilityAndMetadata() {
    await this.refreshAccessibility();
    await this.refreshMetadata();
  }

  async refreshMetadata() {
    this.dependencies.logger.info(`[CLUSTER]: refreshMetadata`, this.cluster.getMeta());
    const metadata = await this.dependencies.detectClusterMetadata(this.cluster);

    runInAction(() => {
      replaceObservableObject(this.cluster.metadata, metadata);
    });
  }

  private async refreshAccessibility(): Promise<void> {
    this.dependencies.logger.info(`[CLUSTER]: refreshAccessibility`, this.cluster.getMeta());
    const proxyConfig = await this.dependencies.loadProxyKubeconfig();
    const api = this.dependencies.createAuthorizationApi(proxyConfig);
    const canI = this.dependencies.createCanI(api);
    const requestNamespaceListPermissions = this.dependencies.createRequestNamespaceListPermissions(api);

    const isAdmin = await canI({
      namespace: "kube-system",
      resource: "*",
      verb: "create",
    });
    const isGlobalWatchEnabled = await canI({
      verb: "watch",
      resource: "*",
    });
    const allowedNamespaces = await this.requestAllowedNamespaces(proxyConfig);
    const knownResources = await (async () => {
      const result = await this.dependencies.requestApiResources(this.cluster);

      if (result.callWasSuccessful) {
        return result.response;
      }

      if (this.cluster.knownResources.length > 0) {
        this.dependencies.logger.warn(`[CLUSTER]: failed to list KUBE resources, sticking with previous list`);

        return this.cluster.knownResources;
      }

      this.dependencies.logger.warn(`[CLUSTER]: failed to list KUBE resources for the first time, blocking connection to cluster...`);
      this.dependencies.broadcastConnectionUpdate({
        level: "error",
        message: "Failed to list kube API resources, please reconnect...",
      });

      return [];
    })();
    const resourcesToShow = await this.getResourcesToShow(allowedNamespaces, knownResources, requestNamespaceListPermissions);

    runInAction(() => {
      this.cluster.isAdmin.set(isAdmin);
      this.cluster.isGlobalWatchEnabled.set(isGlobalWatchEnabled);
      this.cluster.allowedNamespaces.replace(allowedNamespaces);
      this.cluster.knownResources.replace(knownResources);
      this.cluster.resourcesToShow.replace(resourcesToShow);
      this.cluster.ready.set(this.cluster.knownResources.length > 0);
    });

    this.dependencies.logger.debug(`[CLUSTER]: refreshed accessibility data`, this.cluster.getState());
  }

  async refreshConnectionStatus() {
    const connectionStatus = await this.getConnectionStatus();

    runInAction(() => {
      this.cluster.online.set(connectionStatus > ClusterStatus.Offline);
      this.cluster.accessible.set(connectionStatus == ClusterStatus.AccessGranted);
    });
  }

  protected async getConnectionStatus(): Promise<ClusterStatus> {
    try {
      const versionData = await this.dependencies.clusterVersionDetector.detect(this.cluster);

      runInAction(() => {
        this.cluster.metadata.version = versionData.value;
      });

      return ClusterStatus.AccessGranted;
    } catch (error) {
      this.dependencies.logger.error(`[CLUSTER]: Failed to connect to "${this.cluster.contextName.get()}": ${error}`);

      if (isRequestError(error)) {
        if (error.statusCode) {
          if (error.statusCode >= 400 && error.statusCode < 500) {
            this.dependencies.broadcastConnectionUpdate({
              level: "error",
              message: "Invalid credentials",
            });

            return ClusterStatus.AccessDenied;
          }

          const message = String(error.error || error.message) || String(error);

          this.dependencies.broadcastConnectionUpdate({
            level: "error",
            message,
          });

          return ClusterStatus.Offline;
        }

        if (error.failed === true) {
          if (error.timedOut === true) {
            this.dependencies.broadcastConnectionUpdate({
              level: "error",
              message: "Connection timed out",
            });

            return ClusterStatus.Offline;
          }

          this.dependencies.broadcastConnectionUpdate({
            level: "error",
            message: "Failed to fetch credentials",
          });

          return ClusterStatus.AccessDenied;
        }

        const message = String(error.error || error.message) || String(error);

        this.dependencies.broadcastConnectionUpdate({
          level: "error",
          message,
        });
      } else if (error instanceof Error || typeof error === "string") {
        this.dependencies.broadcastConnectionUpdate({
          level: "error",
          message: `${error}`,
        });
      } else {
        this.dependencies.broadcastConnectionUpdate({
          level: "error",
          message: "Unknown error has occurred",
        });
      }

      return ClusterStatus.Offline;
    }
  }

  protected async requestAllowedNamespaces(proxyConfig: KubeConfig) {
    if (this.cluster.accessibleNamespaces.length) {
      return this.cluster.accessibleNamespaces;
    }

    try {
      const api = this.dependencies.createCoreApi(proxyConfig);
      const listNamespaces = this.dependencies.createListNamespaces(api);

      return await listNamespaces();
    } catch (error) {
      const ctx = proxyConfig.getContextObject(this.cluster.contextName.get());
      const namespaceList = [ctx?.namespace].filter(isDefined);

      if (namespaceList.length === 0 && error instanceof HttpError && error.statusCode === 403) {
        const { response } = error as HttpError & { response: Response };

        this.dependencies.logger.info("[CLUSTER]: listing namespaces is forbidden, broadcasting", { clusterId: this.cluster.id, error: response.body });
        this.dependencies.broadcastMessage(clusterListNamespaceForbiddenChannel, this.cluster.id);
      }

      return namespaceList;
    }
  }

  protected async getResourcesToShow(allowedNamespaces: string[], knownResources: KubeApiResource[], req: RequestNamespaceListPermissions) {
    if (!allowedNamespaces.length) {
      return [];
    }

    const requestNamespaceListPermissions = withConcurrencyLimit(5)(req);
    const namespaceListPermissions = allowedNamespaces.map(requestNamespaceListPermissions);
    const canListResources = await Promise.all(namespaceListPermissions);

    return knownResources
      .filter((resource) => canListResources.some(fn => fn(resource)))
      .map(formatKubeApiResource);
  }
}

const clusterConnectionInjectable = getInjectable({
  id: "cluster-connection",
  instantiate: (di, cluster) => new ClusterConnection(
    {
      clusterVersionDetector: di.inject(clusterVersionDetectorInjectable),
      kubeAuthProxyServer: di.inject(kubeAuthProxyServerInjectable, cluster),
      logger: di.inject(loggerInjectionToken),
      prometheusHandler: di.inject(prometheusHandlerInjectable, cluster),
      broadcastConnectionUpdate: di.inject(broadcastConnectionUpdateInjectable, cluster),
      broadcastMessage: di.inject(broadcastMessageInjectable),
      createListNamespaces: di.inject(createListNamespacesInjectable),
      detectClusterMetadata: di.inject(detectClusterMetadataInjectable),
      loadProxyKubeconfig: di.inject(loadProxyKubeconfigInjectable, cluster),
      removeProxyKubeconfig: di.inject(removeProxyKubeconfigInjectable, cluster),
      requestApiResources: di.inject(requestApiResourcesInjectable),
      createAuthorizationApi: di.inject(createAuthorizationApiInjectable),
      createCoreApi: di.inject(createCoreApiInjectable),
      createCanI: di.inject(createCanIInjectable),
      createRequestNamespaceListPermissions: di.inject(createRequestNamespaceListPermissionsInjectable),
    },
    cluster,
  ),
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, cluster: Cluster) => cluster.id,
  }),
});

export default clusterConnectionInjectable;


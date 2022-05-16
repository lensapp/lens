/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PrometheusProvider, PrometheusService } from "../prometheus/provider-registry";
import { PrometheusProviderRegistry } from "../prometheus/provider-registry";
import type { ClusterPrometheusPreferences } from "../../common/cluster-types";
import type { Cluster } from "../../common/cluster/cluster";
import type httpProxy from "http-proxy";
import type { UrlWithStringQuery } from "url";
import url from "url";
import { CoreV1Api } from "@kubernetes/client-node";
import logger from "../logger";
import type { KubeAuthProxy } from "../kube-auth-proxy/kube-auth-proxy";
import type { CreateKubeAuthProxy } from "../kube-auth-proxy/create-kube-auth-proxy.injectable";

export interface PrometheusDetails {
  prometheusPath: string;
  provider: PrometheusProvider;
}

interface PrometheusServicePreferences {
  namespace: string;
  service: string;
  port: number;
  prefix: string;
}

interface Dependencies {
  createKubeAuthProxy: CreateKubeAuthProxy;
  authProxyCa: string;
}

export interface ClusterContextHandler {
  readonly clusterUrl: UrlWithStringQuery;
  setupPrometheus(preferences?: ClusterPrometheusPreferences): void;
  getPrometheusDetails(): Promise<PrometheusDetails>;
  resolveAuthProxyUrl(): Promise<string>;
  resolveAuthProxyCa(): string;
  getApiTarget(isLongRunningRequest?: boolean): Promise<httpProxy.ServerOptions>;
  restartServer(): Promise<void>;
  ensureServer(): Promise<void>;
  stopServer(): void;
}

export class ContextHandler implements ClusterContextHandler {
  public readonly clusterUrl: UrlWithStringQuery;
  protected kubeAuthProxy?: KubeAuthProxy;
  protected apiTarget?: httpProxy.ServerOptions;
  protected prometheusProvider?: string;
  protected prometheus?: PrometheusServicePreferences;

  constructor(private dependencies: Dependencies, protected cluster: Cluster) {
    this.clusterUrl = url.parse(cluster.apiUrl);
    this.setupPrometheus(cluster.preferences);
  }

  public setupPrometheus(preferences: ClusterPrometheusPreferences = {}) {
    this.prometheusProvider = preferences.prometheusProvider?.type;
    this.prometheus = preferences.prometheus;
  }

  public async getPrometheusDetails(): Promise<PrometheusDetails> {
    const service = await this.getPrometheusService();
    const prometheusPath = this.ensurePrometheusPath(service);
    const provider = this.ensurePrometheusProvider(service);

    return { prometheusPath, provider };
  }

  protected ensurePrometheusPath({ service, namespace, port }: PrometheusService): string {
    return `${namespace}/services/${service}:${port}`;
  }

  protected ensurePrometheusProvider(service: PrometheusService): PrometheusProvider {
    if (!this.prometheusProvider) {
      logger.info(`[CONTEXT-HANDLER]: using ${service.id} as prometheus provider for clusterId=${this.cluster.id}`);
      this.prometheusProvider = service.id;
    }

    return PrometheusProviderRegistry.getInstance().getByKind(this.prometheusProvider);
  }

  protected listPotentialProviders(): PrometheusProvider[] {
    const registry = PrometheusProviderRegistry.getInstance();
    const provider = this.prometheusProvider && registry.getByKind(this.prometheusProvider);

    if (provider) {
      return [provider];
    }

    return Array.from(registry.providers.values());
  }

  protected async getPrometheusService(): Promise<PrometheusService> {
    if (this.prometheus && this.prometheusProvider) {
      return {
        id: this.prometheusProvider,
        namespace: this.prometheus.namespace,
        service: this.prometheus.service,
        port: this.prometheus.port,
      };
    }

    const providers = this.listPotentialProviders();
    const proxyConfig = await this.cluster.getProxyKubeconfig();
    const apiClient = proxyConfig.makeApiClient(CoreV1Api);
    const potentialServices = await Promise.allSettled(
      providers.map(provider => provider.getPrometheusService(apiClient)),
    );
    const errors: any[] = [];

    for (const res of potentialServices) {
      switch (res.status) {
        case "rejected":
          if (res.reason) {
            errors.push(String(res.reason));
          }
          break;

        case "fulfilled":
          if (res.value) {
            return res.value;
          }
      }
    }

    throw Object.assign(new Error("No Prometheus service found"), { cause: errors });
  }

  async resolveAuthProxyUrl(): Promise<string> {
    const kubeAuthProxy = await this.ensureServerHelper();
    const path = this.clusterUrl.path !== "/" ? this.clusterUrl.path : "";

    return `https://127.0.0.1:${kubeAuthProxy.port}${kubeAuthProxy.apiPrefix}${path}`;
  }

  resolveAuthProxyCa() {
    return this.dependencies.authProxyCa;
  }

  async getApiTarget(isLongRunningRequest = false): Promise<httpProxy.ServerOptions> {
    const timeout = isLongRunningRequest ? 4 * 60 * 60_000 : 30_000; // 4 hours for long running request, 30 seconds for the rest

    if (isLongRunningRequest) {
      return this.newApiTarget(timeout);
    }

    return this.apiTarget ??= await this.newApiTarget(timeout);
  }

  protected async newApiTarget(timeout: number): Promise<httpProxy.ServerOptions> {
    const kubeAuthProxy = await this.ensureServerHelper();
    const ca = this.resolveAuthProxyCa();
    const clusterPath = this.clusterUrl.path !== "/" ? this.clusterUrl.path : "";
    const apiPrefix = `${kubeAuthProxy.apiPrefix}${clusterPath}`;
    const headers: Record<string, string> = {};

    if (this.clusterUrl.hostname) {
      headers.Host = this.clusterUrl.hostname;
    }

    return {
      target: {
        protocol: "https:",
        host: "127.0.0.1",
        port: kubeAuthProxy.port,
        path: apiPrefix,
        ca,
      },
      changeOrigin: true,
      timeout,
      secure: true,
      headers,
    };
  }

  protected async ensureServerHelper(): Promise<KubeAuthProxy> {
    if (!this.kubeAuthProxy) {
      const proxyEnv = Object.assign({}, process.env);

      if (this.cluster.preferences.httpsProxy) {
        proxyEnv.HTTPS_PROXY = this.cluster.preferences.httpsProxy;
      }
      this.kubeAuthProxy = this.dependencies.createKubeAuthProxy(this.cluster, proxyEnv);
      await this.kubeAuthProxy.run();

      return this.kubeAuthProxy;
    }

    await this.kubeAuthProxy.whenReady;

    return this.kubeAuthProxy;
  }

  async ensureServer(): Promise<void> {
    await this.ensureServerHelper();
  }

  async restartServer(): Promise<void> {
    this.stopServer();

    await this.ensureServerHelper();
  }

  stopServer() {
    this.kubeAuthProxy?.exit();
    this.kubeAuthProxy = undefined;
    this.apiTarget = undefined;
  }
}

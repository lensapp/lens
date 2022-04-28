/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PrometheusProvider, PrometheusService } from "../prometheus/provider-registry";
import { PrometheusProviderRegistry } from "../prometheus/provider-registry";
import type { ClusterPrometheusPreferences } from "../../common/cluster/types";
import type { Cluster } from "../../common/cluster/cluster";
import type httpProxy from "http-proxy";
import type { UrlWithStringQuery } from "url";
import url from "url";
import { CoreV1Api } from "@kubernetes/client-node";
import logger from "../logger";
import type { KubeAuthProxy } from "../kube-auth-proxy/kube-auth-proxy";
import type { CreateKubeAuthProxy } from "../kube-auth-proxy/create-kube-auth-proxy.injectable";
import type { GetKubeAuthProxyCertificate } from "../kube-auth-proxy/get-proxy-cert.injectable";
import type { SelfSignedCert } from "selfsigned";

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

export interface ContextHandlerDependencies {
  createKubeAuthProxy: CreateKubeAuthProxy;
  getKubeAuthProxyCertificate: GetKubeAuthProxyCertificate;
}

export class ContextHandler {
  public readonly clusterUrl: UrlWithStringQuery;
  protected kubeAuthProxy?: KubeAuthProxy;
  protected apiTarget?: httpProxy.ServerOptions;
  protected prometheusProvider?: string;
  protected prometheus?: PrometheusServicePreferences;
  private readonly proxyCert: SelfSignedCert;

  constructor(protected readonly dependencies: ContextHandlerDependencies, protected readonly cluster: Cluster) {
    this.clusterUrl = url.parse(cluster.apiUrl);
    this.setupPrometheus(cluster.preferences);
    this.proxyCert = this.dependencies.getKubeAuthProxyCertificate(new URL(cluster.apiUrl).hostname);
  }

  public setupPrometheus(preferences: ClusterPrometheusPreferences = {}) {
    this.prometheusProvider = preferences.prometheusProvider?.type;
    this.prometheus = preferences.prometheus || null;
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
    if (this.prometheus !== null && this.prometheusProvider !== null) {
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

  async resolveAuthProxyUrl() {
    await this.ensureServer();
    const path = this.clusterUrl.path !== "/" ? this.clusterUrl.path : "";

    return `https://127.0.0.1:${this.kubeAuthProxy.port}${this.kubeAuthProxy.apiPrefix}${path}`;
  }

  resolveAuthProxyCa() {
    return this.proxyCert.cert;
  }

  async getApiTarget(isLongRunningRequest = false): Promise<httpProxy.ServerOptions> {
    const timeout = isLongRunningRequest ? 4 * 60 * 60_000 : 30_000; // 4 hours for long running request, 30 seconds for the rest

    if (isLongRunningRequest) {
      return this.newApiTarget(timeout);
    }

    return this.apiTarget ??= await this.newApiTarget(timeout);
  }

  protected async newApiTarget(timeout: number): Promise<httpProxy.ServerOptions> {
    await this.ensureServer();

    const clusterPath = this.clusterUrl.path !== "/" ? this.clusterUrl.path : "";
    const apiPrefix = `${this.kubeAuthProxy.apiPrefix}${clusterPath}`;

    return {
      target: {
        protocol: "https:",
        host: "127.0.0.1",
        port: this.kubeAuthProxy.port,
        path: apiPrefix,
        ca: this.resolveAuthProxyCa(),
      },
      changeOrigin: true,
      timeout,
      secure: true,
      headers: {
        "Host": this.clusterUrl.hostname,
      },
    };
  }

  async ensureServer() {
    if (!this.kubeAuthProxy) {
      const proxyEnv = Object.assign({}, process.env);

      if (this.cluster.preferences.httpsProxy) {
        proxyEnv.HTTPS_PROXY = this.cluster.preferences.httpsProxy;
      }
      this.kubeAuthProxy = this.dependencies.createKubeAuthProxy(this.cluster, proxyEnv);
      await this.kubeAuthProxy.run();
    }

    await this.kubeAuthProxy.whenReady;
  }

  stopServer() {
    this.kubeAuthProxy?.exit();
    this.kubeAuthProxy = undefined;
    this.apiTarget = undefined;
  }
}

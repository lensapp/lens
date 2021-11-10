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

import type { PrometheusProvider, PrometheusService } from "./prometheus/provider-registry";
import { PrometheusProviderRegistry } from "./prometheus/provider-registry";
import type { ClusterPrometheusPreferences } from "../common/cluster-types";
import type { Cluster } from "./cluster";
import type httpProxy from "http-proxy";
import url, { UrlWithStringQuery } from "url";
import { CoreV1Api } from "@kubernetes/client-node";
import logger from "../common/logger";
import { KubeAuthProxy } from "./kube-auth-proxy";

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

export class ContextHandler {
  public clusterUrl: UrlWithStringQuery;
  protected kubeAuthProxy?: KubeAuthProxy;
  protected apiTarget?: httpProxy.ServerOptions;
  protected prometheusProvider?: string;
  protected prometheus?: PrometheusServicePreferences;

  constructor(protected cluster: Cluster) {
    this.clusterUrl = url.parse(cluster.apiUrl);
    this.setupPrometheus(cluster.preferences);
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

    return `http://127.0.0.1:${this.kubeAuthProxy.port}${this.kubeAuthProxy.apiPrefix}${path}`;
  }

  async getApiTarget(isLongRunningRequest = false): Promise<httpProxy.ServerOptions> {
    const timeout = isLongRunningRequest ? 4 * 60 * 60_000 : 30_000; // 4 hours for long running request, 30 seconds for the rest

    if (isLongRunningRequest) {
      return this.newApiTarget(timeout);
    }

    return this.apiTarget ??= await this.newApiTarget(timeout);
  }

  protected async newApiTarget(timeout: number): Promise<httpProxy.ServerOptions> {
    return {
      target: await this.resolveAuthProxyUrl(),
      changeOrigin: true,
      timeout,
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
      this.kubeAuthProxy = new KubeAuthProxy(this.cluster, proxyEnv);
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

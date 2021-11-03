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
import logger from "./logger";
import { KubeAuthProxy } from "./kube-auth-proxy";

export class ContextHandler {
  public clusterUrl: UrlWithStringQuery;
  protected kubeAuthProxy?: KubeAuthProxy;
  protected apiTarget?: httpProxy.ServerOptions;
  protected prometheusProvider?: string;
  protected prometheusPath: string | null;

  constructor(protected cluster: Cluster) {
    this.clusterUrl = url.parse(cluster.apiUrl);
    this.setupPrometheus(cluster.preferences);
  }

  public setupPrometheus(preferences: ClusterPrometheusPreferences = {}) {
    this.prometheusProvider = preferences.prometheusProvider?.type;
    this.prometheusPath = null;

    if (preferences.prometheus) {
      const { namespace, service, port } = preferences.prometheus;

      this.prometheusPath = `${namespace}/services/${service}:${port}`;
    }
  }

  protected async resolvePrometheusPath(): Promise<string> {
    const prometheusService = await this.getPrometheusService();

    if (!prometheusService) return null;
    const { service, namespace, port } = prometheusService;

    return `${namespace}/services/${service}:${port}`;
  }

  async getPrometheusProvider() {
    if (!this.prometheusProvider) {
      const service = await this.getPrometheusService();

      if (!service) {
        return null;
      }
      logger.info(`using ${service.id} as prometheus provider`);
      this.prometheusProvider = service.id;
    }

    return PrometheusProviderRegistry.getInstance().getByKind(this.prometheusProvider);
  }

  protected listPotentialProviders(): PrometheusProvider[] {
    const registry = PrometheusProviderRegistry.getInstance();

    if (typeof this.prometheusProvider === "string") {
      return [registry.getByKind(this.prometheusProvider)];
    }

    return Array.from(registry.providers.values());
  }

  async getPrometheusService(): Promise<PrometheusService | undefined> {
    const providers = this.listPotentialProviders();
    const proxyConfig = await this.cluster.getProxyKubeconfig();
    const apiClient = proxyConfig.makeApiClient(CoreV1Api);
    const potentialServices = await Promise.allSettled(
      providers.map(provider => provider.getPrometheusService(apiClient)),
    );

    for (const result of potentialServices) {
      if (result.status === "fulfilled" && result.value) {
        return result.value;
      }
    }

    return undefined;
  }

  async getPrometheusPath(): Promise<string> {
    if (!this.prometheusPath) {
      this.prometheusPath = await this.resolvePrometheusPath();
    }

    return this.prometheusPath;
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
      this.kubeAuthProxy.run();
    }

    await this.kubeAuthProxy.whenReady;
  }

  stopServer() {
    this.kubeAuthProxy?.exit();
    this.kubeAuthProxy = undefined;
    this.apiTarget = undefined;
  }

  get proxyLastError(): string {
    return this.kubeAuthProxy?.lastError || "";
  }
}

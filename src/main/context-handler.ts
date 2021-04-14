import type { PrometheusService } from "./prometheus/provider-registry";
import type { ClusterPrometheusPreferences } from "../common/cluster-store";
import type { Cluster } from "./cluster";
import type httpProxy from "http-proxy";
import url, { UrlWithStringQuery } from "url";
import { CoreV1Api } from "@kubernetes/client-node";
import { prometheusProviders } from "../common/prometheus-providers";
import logger from "./logger";
import { getFreePort } from "./port";
import { KubeAuthProxy } from "./kube-auth-proxy";
import { assert, NotFalsy } from "../common/utils";
import { AssertionError } from "assert";

interface VerifiedUrl extends UrlWithStringQuery {
  hostname: string;
}

export class ContextHandler {
  public proxyPort?: number;
  public clusterUrl: VerifiedUrl;
  protected kubeAuthProxy?: KubeAuthProxy;
  protected apiTarget?: httpProxy.ServerOptions;
  protected prometheusProvider?: string;
  protected prometheusPath?: string;

  constructor(protected cluster: Cluster) {
    const apiUrl = assert(cluster.apiUrl, "ContextHandler may only be created for valid clusters");

    const clusterUrl = url.parse(apiUrl);

    if (!clusterUrl.hostname) {
      throw new AssertionError({
        actual: clusterUrl.hostname,
        message: "clusterUrl must have a hostname"
      });
    }

    this.clusterUrl = clusterUrl as VerifiedUrl;
    this.setupPrometheus(cluster.preferences);
  }

  public setupPrometheus(preferences: ClusterPrometheusPreferences = {}) {
    this.prometheusProvider = preferences.prometheusProvider?.type;

    if (preferences.prometheus) {
      const { namespace, service, port } = preferences.prometheus;

      this.prometheusPath = `${namespace}/services/${service}:${port}`;
    } else {
      this.prometheusPath = undefined;
    }
  }

  protected async resolvePrometheusPath(): Promise<string | undefined> {
    const prometheusService = await this.getPrometheusService();

    if (!prometheusService) return;

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

    return prometheusProviders.find(p => p.id === this.prometheusProvider);
  }

  async getPrometheusService(): Promise<PrometheusService | undefined> {
    const providers = this.prometheusProvider ? prometheusProviders.filter(provider => provider.id == this.prometheusProvider) : prometheusProviders;

    return (await Promise.allSettled(providers
      .map(provider => (
        this.cluster.getProxyKubeconfig()
          .then(kc => kc.makeApiClient(CoreV1Api))
          .then(client => provider.getPrometheusService(client))
      ))
    ))
      .map(result => (
        result.status === "fulfilled"
          ? result.value
          : undefined
      ))
      .find(NotFalsy);
  }

  async getPrometheusPath(): Promise<string | undefined> {
    return this.prometheusPath ??= await this.resolvePrometheusPath();
  }

  async resolveAuthProxyUrl() {
    const proxyPort = await this.ensurePort();
    const path = this.clusterUrl.path !== "/" ? this.clusterUrl.path : "";

    return `http://127.0.0.1:${proxyPort}${path}`;
  }

  async getApiTarget(isWatchRequest = false): Promise<httpProxy.ServerOptions> {
    if (this.apiTarget && !isWatchRequest) {
      return this.apiTarget;
    }
    const timeout = isWatchRequest ? 4 * 60 * 60 * 1000 : 30000; // 4 hours for watch request, 30 seconds for the rest
    const apiTarget = await this.newApiTarget(timeout);

    if (!isWatchRequest) {
      this.apiTarget = apiTarget;
    }

    return apiTarget;
  }

  protected async newApiTarget(timeout: number): Promise<httpProxy.ServerOptions> {
    const proxyUrl = await this.resolveAuthProxyUrl();

    return {
      target: proxyUrl,
      changeOrigin: true,
      timeout,
      headers: {
        "Host": this.clusterUrl.hostname,
      },
    };
  }

  async ensurePort(): Promise<number> {
    return this.proxyPort ??= await getFreePort();
  }

  async ensureServer() {
    if (!this.kubeAuthProxy) {
      await this.ensurePort();
      const proxyEnv = Object.assign({}, process.env);

      if (this.cluster.preferences.httpsProxy) {
        proxyEnv.HTTPS_PROXY = this.cluster.preferences.httpsProxy;
      }
      this.kubeAuthProxy = new KubeAuthProxy(this.cluster, await this.ensurePort(), proxyEnv);
      await this.kubeAuthProxy.run();
    }
  }

  stopServer() {
    if (this.kubeAuthProxy) {
      this.kubeAuthProxy.exit();
      this.kubeAuthProxy = undefined;
    }
  }

  get proxyLastError(): string {
    return this.kubeAuthProxy?.lastError || "";
  }
}

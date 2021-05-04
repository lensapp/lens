import type { PrometheusProvider, PrometheusService } from "./prometheus/provider-registry";
import type { ClusterPrometheusPreferences } from "../common/cluster-store";
import type { Cluster } from "./cluster";
import type httpProxy from "http-proxy";
import url, { UrlWithStringQuery } from "url";
import { CoreV1Api } from "@kubernetes/client-node";
import { prometheusProviders } from "../common/prometheus-providers";
import logger from "./logger";
import { KubeAuthProxy } from "./kube-auth-proxy";

export class ContextHandler {
  public clusterUrl: UrlWithStringQuery;
  protected kubeAuthProxy?: KubeAuthProxy;
  protected apiTarget?: httpProxy.ServerOptions;
  protected prometheusProvider: string;
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

    return prometheusProviders.find(p => p.id === this.prometheusProvider);
  }

  async getPrometheusService(): Promise<PrometheusService> {
    const providers = this.prometheusProvider ? prometheusProviders.filter(provider => provider.id == this.prometheusProvider) : prometheusProviders;
    const prometheusPromises: Promise<PrometheusService>[] = providers.map(async (provider: PrometheusProvider): Promise<PrometheusService> => {
      const apiClient = (await this.cluster.getProxyKubeconfig()).makeApiClient(CoreV1Api);

      return await provider.getPrometheusService(apiClient);
    });
    const resolvedPrometheusServices = await Promise.all(prometheusPromises);

    return resolvedPrometheusServices.filter(n => n)[0];
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

    return `http://127.0.0.1:${this.kubeAuthProxy.port}${path}`;
  }

  async getApiTarget(isWatchRequest = false): Promise<httpProxy.ServerOptions> {
    const timeout = isWatchRequest ? 4 * 60 * 60 * 1000 : 30000; // 4 hours for watch request, 30 seconds for the rest

    if (isWatchRequest) {
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

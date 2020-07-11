import type { PrometheusProvider, PrometheusService } from "./prometheus/provider-registry"
import type { ClusterPreferences } from "../common/cluster-store";
import type { Cluster } from "./cluster"
import type httpProxy from "http-proxy"
import { CoreV1Api } from "@kubernetes/client-node"
import { observable } from "mobx";
import { prometheusProviders } from "../common/prometheus-providers"
import logger from "./logger"
import { getFreePort } from "./port"
import { KubeAuthProxy } from "./kube-auth-proxy"

export class ContextHandler {
  @observable proxyPort: number;

  protected proxyServer: KubeAuthProxy
  protected apiTarget: httpProxy.ServerOptions
  protected prometheusProvider: string
  protected prometheusPath: string

  constructor(protected cluster: Cluster) {
    this.setupPrometheus(cluster.preferences)
  }

  public setupPrometheus(preferences: ClusterPreferences = {}) {
    this.prometheusProvider = preferences.prometheusProvider?.type;
    this.prometheusPath = null;
    if (preferences.prometheus) {
      const { namespace, service, port } = preferences.prometheus
      this.prometheusPath = `${namespace}/services/${service}:${port}`
    }
  }

  protected async resolvePrometheusPath(): Promise<string> {
    const { service, namespace, port } = await this.getPrometheusService()
    return `${namespace}/services/${service}:${port}`
  }

  public async getPrometheusProvider() {
    if (!this.prometheusProvider) {
      const service = await this.getPrometheusService()
      logger.info(`using ${service.id} as prometheus provider`)
      this.prometheusProvider = service.id
    }
    return prometheusProviders.find(p => p.id === this.prometheusProvider)
  }

  public async getPrometheusService(): Promise<PrometheusService> {
    const providers = this.prometheusProvider ? prometheusProviders.filter(provider => provider.id == this.prometheusProvider) : prometheusProviders;
    const prometheusPromises: Promise<PrometheusService>[] = providers.map(async (provider: PrometheusProvider): Promise<PrometheusService> => {
      const apiClient = this.cluster.proxyKubeconfig().makeApiClient(CoreV1Api)
      return await provider.getPrometheusService(apiClient)
    })
    const resolvedPrometheusServices = await Promise.all(prometheusPromises)
    const service = resolvedPrometheusServices.filter(n => n)[0];
    return service || {
      id: "lens",
      namespace: "lens-metrics",
      service: "prometheus",
      port: 80
    }
  }

  public async getPrometheusPath(): Promise<string> {
    if (!this.prometheusPath) {
      this.prometheusPath = await this.resolvePrometheusPath()
    }
    return this.prometheusPath;
  }

  public async getApiTarget(isWatchRequest = false): Promise<httpProxy.ServerOptions> {
    if (this.apiTarget && !isWatchRequest) {
      return this.apiTarget
    }
    const timeout = isWatchRequest ? 4 * 60 * 60 * 1000 : 30000 // 4 hours for watch request, 30 seconds for the rest
    const apiTarget = await this.newApiTarget(timeout)
    if (!isWatchRequest) {
      this.apiTarget = apiTarget
    }
    return apiTarget
  }

  public async getApiTargetUrl(): Promise<string> {
    const port = await this.ensurePort();
    const { path } = this.cluster.apiUrl;
    return `http://127.0.0.1:${port}${path}`;
  }

  protected async newApiTarget(timeout: number): Promise<httpProxy.ServerOptions> {
    return {
      changeOrigin: true,
      target: await this.getApiTargetUrl(),
      timeout: timeout,
      headers: {
        "Host": this.cluster.apiUrl.hostname,
      }
    }
  }

  async ensurePort(): Promise<number> {
    if (!this.proxyPort) {
      this.proxyPort = await getFreePort();
    }
    return this.proxyPort
  }

  public async ensureServer() {
    if (!this.proxyServer) {
      await this.ensurePort();
      const proxyEnv = Object.assign({}, process.env)
      if (this.cluster.preferences.httpsProxy) {
        proxyEnv.HTTPS_PROXY = this.cluster.preferences.httpsProxy
      }
      this.proxyServer = new KubeAuthProxy(this.cluster, this.proxyPort, proxyEnv)
      await this.proxyServer.run()
    }
  }

  public stopServer() {
    if (this.proxyServer) {
      this.proxyServer.exit()
      this.proxyServer = null
    }
  }

  public proxyServerError(): string {
    return this.proxyServer?.lastError || ""
  }
}

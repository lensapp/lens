import type { PrometheusProvider, PrometheusService } from "./prometheus/provider-registry"
import type { ClusterPreferences } from "../common/cluster-store";
import type { ServerOptions } from "http-proxy"
import type { Cluster } from "./cluster"
import { CoreV1Api } from "@kubernetes/client-node"
import { prometheusProviders } from "../common/prometheus-providers"
import logger from "./logger"
import { getFreePort } from "./port"
import { KubeAuthProxy } from "./kube-auth-proxy"

export class ContextHandler {
  public url: string
  public proxyPort: number
  public contextName: string

  protected id: string
  protected proxyServer: KubeAuthProxy
  protected apiTarget: ServerOptions
  protected certData: string
  protected authCertData: string
  protected proxyTarget: ServerOptions
  protected clientCert: string
  protected clientKey: string
  protected prometheusProvider: string
  protected prometheusPath: string
  protected clusterName: string

  constructor(protected cluster: Cluster) {
    this.id = cluster.id
    this.url = cluster.apiUrl.href;
    this.contextName = cluster.contextName;
    this.setClusterPreferences(cluster.preferences)
  }

  public setClusterPreferences(preferences: ClusterPreferences = {}) {
    this.clusterName = preferences.clusterName || this.contextName;
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
    const providers = this.prometheusProvider ? prometheusProviders.filter((p, _) => p.id == this.prometheusProvider) : prometheusProviders
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

  public async getApiTarget(isWatchRequest = false): Promise<ServerOptions> {
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

  protected async newApiTarget(timeout: number): Promise<ServerOptions> {
    const clusterUrl = this.cluster.apiUrl;
    return {
      changeOrigin: true,
      timeout: timeout,
      headers: {
        "Host": clusterUrl.hostname
      },
      target: {
        port: await this.resolveProxyPort(),
        protocol: "http://",
        host: "localhost",
        path: clusterUrl.path,
      },
    }
  }

  async resolveProxyPort(): Promise<number> {
    if (!this.proxyPort) {
      this.proxyPort = await getFreePort()
    }
    return this.proxyPort
  }

  public async withTemporaryKubeconfig(callback: (kubeconfig: string) => Promise<any>) {
    try {
      await callback(this.cluster.proxyKubeconfigPath())
    } catch (error) {
      throw(error)
    }
  }

  public async ensureServer() {
    if (!this.proxyServer) {
      const proxyPort = await this.resolveProxyPort()
      const proxyEnv = Object.assign({}, process.env)
      if (this.cluster.preferences.httpsProxy) {
        proxyEnv.HTTPS_PROXY = this.cluster.preferences.httpsProxy
      }
      this.proxyServer = new KubeAuthProxy(this.cluster, proxyPort, proxyEnv)
      await this.proxyServer.run()
    }
  }

  public stopServer() {
    if (this.proxyServer) {
      this.proxyServer.exit()
      this.proxyServer = null
    }
  }

  public proxyServerError() {
    return this.proxyServer?.lastError || ""
  }
}

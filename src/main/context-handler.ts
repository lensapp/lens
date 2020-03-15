import { app } from "electron"
import { KubeConfig } from "@kubernetes/client-node"
import { readFileSync } from "fs"
import * as http from "http"
import { ServerOptions } from "http-proxy"
import * as url from "url"
import { v4 as uuid } from "uuid"
import logger from "./logger"
import { getFreePort } from "./port"
import { LensServer } from "./lens-server"
import { KubeAuthProxy } from "./kube-auth-proxy"
import { Cluster, ClusterPreferences } from "./cluster"
import { userStore } from "../common/user-store"

export class ContextHandler {
  public contextName: string
  public id: string
  public url: string
  public kc: KubeConfig
  public certData: string
  public authCertData: string
  public cluster: Cluster

  protected apiTarget: ServerOptions
  protected proxyTarget: ServerOptions
  protected clusterUrl: url.UrlWithStringQuery
  protected localServer: LensServer
  protected proxyServer: KubeAuthProxy

  protected clientCert: string
  protected clientKey: string
  protected secureApiConnection = true
  protected defaultNamespace: string
  protected port: number
  protected proxyPort: number
  protected kubernetesApi: string
  protected prometheusPath: string
  protected clusterName: string

  constructor(kc: KubeConfig, cluster: Cluster) {
    this.id = cluster.id
    this.kc = new KubeConfig()
    this.kc.users = [
      {
        name: kc.getCurrentUser().name,
        token: this.id
      }
    ]
    this.kc.contexts = [
      {
        name: kc.currentContext,
        cluster: kc.getCurrentCluster().name,
        user: kc.getCurrentUser().name,
        namespace: kc.getContextObject(kc.currentContext).namespace
      }
    ]
    this.kc.setCurrentContext(kc.currentContext)

    this.cluster = cluster
    this.clusterUrl = url.parse(kc.getCurrentCluster().server)
    this.contextName = kc.currentContext;
    this.defaultNamespace = kc.getContextObject(kc.currentContext).namespace
    this.url = `http://${this.id}.localhost:${cluster.port}/`
    this.kubernetesApi = `http://127.0.0.1:${cluster.port}/${this.id}`
    this.setClusterPreferences(cluster.preferences)
    this.kc.clusters = [
      {
        name: kc.getCurrentCluster().name,
        server: this.kubernetesApi,
        skipTLSVerify: true
      }
    ]
  }

  public setClusterPreferences(clusterPreferences?: ClusterPreferences) {
    if (clusterPreferences && clusterPreferences.prometheus) {
      const prom = clusterPreferences.prometheus
      this.prometheusPath = `${prom.namespace}/services/${prom.service}:${prom.port}`
    } else {
      this.prometheusPath = "lens-metrics/services/prometheus:80"
    }
    if(clusterPreferences && clusterPreferences.clusterName) {
      this.clusterName = clusterPreferences.clusterName;
    } else {
      this.clusterName = this.contextName;
    }
  }

  public async init() {
    const currentCluster = this.kc.getCurrentCluster()
    if (currentCluster.caFile) {
      this.certData = readFileSync(currentCluster.caFile).toString()
    } else if (currentCluster.caData) {
      this.certData = Buffer.from(currentCluster.caData, "base64").toString("ascii")
    }
    const user = this.kc.getCurrentUser()
    if (user.authProvider && user.authProvider.name === "oidc") {
      const authConfig = user.authProvider.config
      if (authConfig["idp-certificate-authority"]) {
        this.authCertData = readFileSync(authConfig["idp-certificate-authority"]).toString()
      } else if (authConfig["idp-certificate-authority-data"]) {
        this.authCertData = Buffer.from(authConfig["idp-certificate-authority-data"], "base64").toString("ascii")
      }
    }
  }

  public async getApiTarget() {
    if (this.apiTarget) { return this.apiTarget }

    this.apiTarget = {
      changeOrigin: true,
      timeout: 30000,
      headers: {
        "Host": this.clusterUrl.hostname
      },
      target: {
        port: await this.resolveProxyPort(),
        protocol: "http://",
        host: "localhost",
        path: this.clusterUrl.path
      },
    }

    return this.apiTarget
  }

  public async getProxyTarget() {
    if (this.proxyTarget) {
      return this.proxyTarget;
    }

    this.proxyTarget = {
      changeOrigin: true,
      secure: false,
      target: {
        host: this.clusterUrl.host,
        hostname: "localhost",
        path: "/",
        port: await this.resolvePort(),
        protocol: "http://",
      },
    }

    return this.proxyTarget;
  }

  protected async resolvePort(): Promise<number> {
    if (this.port) return this.port

    let serverPort: number = null
    try {
      serverPort = await getFreePort(49153, 49900) // the proxy will usually already be on 49152 so skip that
    } catch(error) {
      logger.error(error)
      throw(error)
    }
    this.port = serverPort

    return serverPort
  }

  protected async resolveProxyPort(): Promise<number> {
    if (this.proxyPort) return this.proxyPort

    let serverPort: number = null
    try {
      serverPort = await getFreePort(49901, 65535)
    } catch(error) {
      logger.error(error)
      throw(error)
    }
    this.proxyPort = serverPort

    return serverPort
  }

  public applyHeaders(req: http.IncomingMessage) {
    req.headers["authorization"] = `Bearer ${this.id}`
  }

  public async withTemporaryKubeconfig(callback: (kubeconfig: string) => Promise<any>) {
    try {
      await callback(this.cluster.kubeconfigPath())
    } catch(error) {
      throw(error)
    }
  }

  protected initServer(serverUrl: string, port: number) {
    const userPrefs = userStore.getPreferences()
    const envs = {
      KUBE_CLUSTER_URL: serverUrl,
      KUBE_CLUSTER_NAME: this.clusterName,
      KUBERNETES_TLS_SKIP: "true",
      KUBERNETES_NAMESPACE: this.defaultNamespace,
      SESSION_SECRET: this.id,
      LOCAL_SERVER_PORT: port.toString(),
      KUBE_METRICS_URL: `${serverUrl}/api/v1/namespaces/${this.prometheusPath}/proxy`,
      STATS_NAMESPACE_DEFAULT: this.prometheusPath.split("/")[0],
      CHARTS_ENABLED: "true",
      LENS_VERSION: app.getVersion(),
      LENS_THEME: `kontena-${userPrefs.colorTheme}`,
      NODE_ENV: "production",
    }
    logger.debug(`spinning up lens-server process with env: ${JSON.stringify(envs)}`)
    this.localServer = new LensServer(serverUrl, envs)
  }

  public async ensureServer() {
    if (!this.localServer) {
      const currentCluster = this.kc.getCurrentCluster()
      const clusterUrl = url.parse(currentCluster.server)
      const serverPort = await this.resolvePort()
      logger.info(`initializing server for ${clusterUrl.host} on port ${serverPort}`)
      this.initServer(this.kubernetesApi, serverPort)
      await this.localServer.run()
    }
    if (!this.proxyServer) {
      const proxyPort = await this.resolveProxyPort()
      const proxyEnv = Object.assign({}, process.env)
      if (this.cluster.preferences && this.cluster.preferences.httpsProxy) {
        proxyEnv.HTTPS_PROXY = this.cluster.preferences.httpsProxy
      }
      this.proxyServer = new KubeAuthProxy(this.cluster, proxyPort, proxyEnv)
      await this.proxyServer.run()
    }
  }

  public stopServer() {
    if (this.localServer) {
      this.localServer.exit()
      this.localServer = null
    }
    if (this.proxyServer) {
      this.proxyServer.exit()
      this.proxyServer = null
    }
  }

  public proxyServerError() {
    if (!this.proxyServer) { return null }

    return this.proxyServer.lastError
  }
}

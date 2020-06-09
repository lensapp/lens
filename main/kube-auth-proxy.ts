import { spawn, ChildProcess } from "child_process"
import logger from "./logger"
import * as tcpPortUsed from "tcp-port-used"
import { Kubectl, bundledKubectl } from "./kubectl"
import { Cluster } from "./cluster"
import { readFileSync, watch } from "fs"
import { PromiseIpc } from "electron-promise-ipc"
import { findMainWebContents } from "./webcontents"
import * as url from "url"

export class KubeAuthProxy {
  public lastError: string

  protected cluster: Cluster
  protected env: NodeJS.ProcessEnv = null
  protected proxyProcess: ChildProcess
  protected port: number
  protected kubectl: Kubectl
  protected promiseIpc: any

  constructor(cluster: Cluster, port: number, env: NodeJS.ProcessEnv) {
    this.env = env
    this.port = port
    this.cluster = cluster
    this.kubectl = bundledKubectl
    this.promiseIpc = new PromiseIpc({ timeout: 2000 })
  }

  public async run(): Promise<void> {
    if (this.proxyProcess) {
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
    const proxyBin = await this.kubectl.kubectlPath()
    const configWatcher = watch(this.cluster.kubeconfigPath(), (eventType: string, filename: string) => {
      if (eventType === "change") {
        const kc = readFileSync(this.cluster.kubeconfigPath()).toString()
        if (kc.trim().length > 0) { // Prevent updating empty configs back to store
          this.cluster.updateKubeconfig(kc)
        } else {
          logger.warn(`kubeconfig watch on ${this.cluster.kubeconfigPath()} resulted into empty config, ignoring...`)
        }
      }
    })
    configWatcher.on("error", () => {})
    const clusterUrl = url.parse(this.cluster.apiUrl)
    let args = [
      "proxy",
      "-p", this.port.toString(),
      "--kubeconfig", this.cluster.kubeconfigPath(),
      "--accept-hosts", clusterUrl.hostname,
    ]
    if (process.env.DEBUG_PROXY === "true") {
      args = args.concat(["-v", "9"])
    }
    this.proxyProcess = spawn(proxyBin, args, {
      env: this.env
    })
    this.proxyProcess.on("exit", (code) => {
      logger.error(`proxy ${this.cluster.contextName} exited with code ${code}`)
      this.sendIpcLogMessage( `proxy exited with code ${code}`, "stderr").catch((_) => {})
      this.proxyProcess = null
      configWatcher.close()
    })
    this.proxyProcess.stdout.on('data', (data) => {
      let logItem = data.toString()
      if (logItem.startsWith("Starting to serve on")) {
        logItem = "Authentication proxy started\n"
      }
      logger.debug(`proxy ${this.cluster.contextName} stdout: ${logItem}`)
      this.sendIpcLogMessage(logItem, "stdout")
    })
    this.proxyProcess.stderr.on('data', (data) => {
      this.lastError = this.parseError(data.toString())
      logger.debug(`proxy ${this.cluster.contextName} stderr: ${data}`)
      this.sendIpcLogMessage(data.toString(), "stderr")
    })

    return tcpPortUsed.waitUntilUsed(this.port, 500, 10000)
  }

  protected parseError(data: string) {
    const error = data.split("http: proxy error:").slice(1).join("").trim()
    let errorMsg = error
    const jsonError = error.split("Response: ")[1]
    if (jsonError) {
      try {
        const parsedError = JSON.parse(jsonError)
        errorMsg = parsedError.error_description || parsedError.error || jsonError
      } catch(_) {
        errorMsg = jsonError.trim()
      }
    }
    return errorMsg
  }

  protected async sendIpcLogMessage(data: string, stream: string) {
    await this.promiseIpc.send(`kube-auth:${this.cluster.id}`, findMainWebContents(), { data: data, stream: stream })
  }

  public exit() {
    if (this.proxyProcess) {
      logger.debug(`Stopping local proxy: ${this.cluster.contextName}`)
      this.proxyProcess.kill()
    }
  }
}

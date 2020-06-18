import { spawn, ChildProcess } from "child_process"
import logger from "./logger"
import * as tcpPortUsed from "tcp-port-used"
import { Kubectl, bundledKubectl } from "./kubectl"
import { Cluster } from "./cluster"
import { PromiseIpc } from "electron-promise-ipc"
import { findMainWebContents } from "./webcontents"

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
      return;
    }
    const proxyBin = await this.kubectl.kubectlPath()
    let args = [
      "proxy",
      "-p", this.port.toString(),
      "--kubeconfig", this.cluster.kubeConfigPath,
      "--context", this.cluster.contextName,
      "--accept-hosts", ".*",
      "--reject-paths", "^[^/]"
    ]
    if (process.env.DEBUG_PROXY === "true") {
      args = args.concat(["-v", "9"])
    }
    logger.debug(`spawning kubectl proxy with args: ${args}`)
    this.proxyProcess = spawn(proxyBin, args, {
      env: this.env
    })
    this.proxyProcess.on("exit", (code) => {
      logger.error(`proxy ${this.cluster.contextName} exited with code ${code}`)
      this.sendIpcLogMessage( `proxy exited with code ${code}`, "stderr").catch((err: Error) => {
        logger.debug("failed to send IPC log message: " + err.message)
      })
      this.proxyProcess = null
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
    await this.promiseIpc.send(`kube-auth:${this.cluster.id}`, findMainWebContents(), { data, stream })
  }

  public exit() {
    if (this.proxyProcess) {
      logger.debug(`Stopping local proxy: ${this.cluster.contextName}`)
      this.proxyProcess.kill()
    }
  }
}

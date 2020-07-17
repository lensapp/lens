import { ChildProcess, spawn } from "child_process"
import { waitUntilUsed } from "tcp-port-used";
import { sendMessage } from "../common/ipc";
import type { Cluster } from "./cluster"
import { bundledKubectl, Kubectl } from "./kubectl"
import logger from "./logger"

export interface KubeAuthProxyResponse {
  data: string;
  stream: "stderr" | "stdout";
}

export class KubeAuthProxy {
  public lastError: string

  protected cluster: Cluster
  protected env: NodeJS.ProcessEnv = null
  protected proxyProcess: ChildProcess
  protected port: number
  protected kubectl: Kubectl

  constructor(cluster: Cluster, port: number, env: NodeJS.ProcessEnv) {
    this.env = env
    this.port = port
    this.cluster = cluster
    this.kubectl = bundledKubectl
  }

  public async run(): Promise<void> {
    if (this.proxyProcess) {
      return;
    }
    const proxyBin = await this.kubectl.getPath()
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
      if (code) {
        logger.error(`[KUBE-AUTH]: proxying ${this.cluster.contextName} exited with code ${code}`, this.cluster.getMeta());
      }
      this.sendIpcLogMessage({ data: `proxy exited with code ${code}`, stream: "stderr" })
      this.proxyProcess = null
    })
    this.proxyProcess.stdout.on('data', (data) => {
      let logItem = data.toString()
      if (logItem.startsWith("Starting to serve on")) {
        logItem = "Authentication proxy started\n"
      }
      this.sendIpcLogMessage({ data: logItem, stream: "stdout" })
    })
    this.proxyProcess.stderr.on('data', (data) => {
      this.lastError = this.parseError(data.toString())
      this.sendIpcLogMessage({ data: data.toString(), stream: "stderr" })
    })

    return waitUntilUsed(this.port, 500, 10000)
  }

  protected parseError(data: string) {
    const error = data.split("http: proxy error:").slice(1).join("").trim()
    let errorMsg = error
    const jsonError = error.split("Response: ")[1]
    if (jsonError) {
      try {
        const parsedError = JSON.parse(jsonError)
        errorMsg = parsedError.error_description || parsedError.error || jsonError
      } catch (_) {
        errorMsg = jsonError.trim()
      }
    }
    return errorMsg
  }

  protected async sendIpcLogMessage(res: KubeAuthProxyResponse) {
    const channel = `kube-auth:${this.cluster.id}`
    logger.debug(`[KUBE-AUTH]: output for ${channel}`, { ...res, meta: this.cluster.getMeta() });
    sendMessage({
      // webContentId: null, // todo: send a message only to single cluster's window
      channel: channel,
      args: [res],
    });
  }

  public exit() {
    if (this.proxyProcess) {
      logger.debug(`Stopping local proxy: ${this.cluster.contextName}`)
      this.proxyProcess.kill()
    }
  }
}

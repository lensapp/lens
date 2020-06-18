import { app } from "electron"
import fs from "fs"
import { ensureDir, randomFileName} from "./file-helpers"
import logger from "./logger"
import { Cluster } from "./cluster"
import * as k8s from "./k8s"
import { KubeConfig } from "@kubernetes/client-node"

export class KubeconfigManager {
  protected configDir = app.getPath("temp")
  protected tempFile: string
  protected cluster: Cluster

  constructor(cluster: Cluster) {
    this.cluster = cluster
    this.tempFile = this.createTemporaryKubeconfig()
  }

  public getPath() {
    return this.tempFile
  }

  /**
   * Creates new "temporary" kubeconfig that point to the kubectl-proxy. 
   * This way any user of the config does not need to know anything about the auth etc. details.
   */
  protected createTemporaryKubeconfig(): string {
    ensureDir(this.configDir)
    const path = `${this.configDir}/${randomFileName("kubeconfig")}`
    const originalKc = new KubeConfig()
    originalKc.loadFromFile(this.cluster.kubeConfigPath)
    const kc = {
      clusters: [
        {
          name: this.cluster.contextName,
          server: `http://127.0.0.1:${this.cluster.contextHandler.proxyPort}`
        }
      ],
      users: [
        {
          name: "proxy"
        }
      ],
      contexts: [
        {
          name: this.cluster.contextName,
          cluster: this.cluster.contextName,
          namespace: originalKc.getContextObject(this.cluster.contextName).namespace,
          user: "proxy"
        }
      ],
      currentContext: this.cluster.contextName
    } as KubeConfig
    fs.writeFileSync(path, k8s.dumpConfigYaml(kc))
    return path
  }

  public unlink() {
    logger.debug('Deleting temporary kubeconfig: ' + this.tempFile)
    fs.unlinkSync(this.tempFile)
  }
}

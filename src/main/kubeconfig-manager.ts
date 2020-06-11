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

  protected createTemporaryKubeconfig(): string {
    ensureDir(this.configDir)
    const path = `${this.configDir}/${randomFileName("kubeconfig")}`
    logger.debug('Creating temporary kubeconfig: ' + path)
    logger.debug(`cluster url: ${this.cluster.url}`)
    logger.debug(`cluster api url: ${this.cluster.apiUrl}`)

    // TODO Make the names come from actual cluster.name etc.
    let kc = {
      clusters: [
        {
          name: this.cluster.contextName,
          server: `http://127.0.0.1:${this.cluster.port}/${this.cluster.id}`
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

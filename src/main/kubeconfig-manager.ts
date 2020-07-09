import { app } from "electron"
import fs from "fs"
import { ensureDir, randomFileName } from "./file-helpers"
import logger from "./logger"
import { Cluster } from "./cluster"
import { dumpConfigYaml } from "./k8s"
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
    ensureDir(this.configDir);
    const path = `${this.configDir}/${randomFileName("kubeconfig")}`
    const { contextName, contextHandler, kubeConfigPath } = this.cluster;
    const kubeConfig = new KubeConfig()
    kubeConfig.loadFromFile(kubeConfigPath)
    kubeConfig.clusters = [
      {
        name: contextName,
        server: `http://127.0.0.1:${contextHandler.proxyPort}`,
        skipTLSVerify: true,
      }
    ];
    kubeConfig.users = [
      { name: "proxy" },
    ];
    kubeConfig.currentContext = contextName;
    kubeConfig.contexts = [
      {
        name: contextName,
        cluster: contextName,
        namespace: kubeConfig.getContextObject(contextName).namespace,
        user: "proxy"
      }
    ];
    fs.writeFileSync(path, dumpConfigYaml(kubeConfig));
    return path
  }

  public unlink() {
    logger.debug('Deleting temporary kubeconfig: ' + this.tempFile)
    fs.unlinkSync(this.tempFile)
  }
}

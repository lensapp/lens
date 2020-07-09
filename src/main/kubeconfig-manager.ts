import type { Cluster } from "./cluster"
import { app } from "electron"
import fs from "fs"
import { KubeConfig } from "@kubernetes/client-node"
import { ensureDir, randomFileName } from "./file-helpers"
import { dumpConfigYaml } from "./k8s"
import logger from "./logger"

export class KubeconfigManager {
  protected configDir = app.getPath("temp")
  protected tempFile: string

  constructor(protected cluster: Cluster, protected proxyPort: number) {
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
    const { contextName, kubeConfigPath } = this.cluster;
    const kubeConfig = new KubeConfig()
    kubeConfig.loadFromFile(kubeConfigPath)
    kubeConfig.clusters = [
      {
        name: contextName,
        server: `http://127.0.0.1:${this.proxyPort}`,
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

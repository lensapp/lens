import type { Cluster } from "./cluster"
import { app } from "electron"
import fs from "fs-extra"
import { KubeConfig } from "@kubernetes/client-node"
import { randomFileName } from "../common/utils"
import { dumpConfigYaml, loadKubeConfig } from "./k8s"
import logger from "./logger"

export class KubeconfigManager {
  public config: KubeConfig;
  protected configDir = app.getPath("temp")
  protected tempFile: string

  constructor(protected cluster: Cluster) {
    this.tempFile = this.createTemporaryKubeconfig();
  }

  getPath() {
    return this.tempFile;
  }

  getCurrentClusterServer() {
    return this.config.getCurrentCluster().server;
  }

  protected loadConfig() {
    const { kubeConfigPath, kubeConfig } = this.cluster;
    this.config = loadKubeConfig(kubeConfigPath || kubeConfig);
    return this.config;
  }

  /**
   * Creates new "temporary" kubeconfig that point to the kubectl-proxy.
   * This way any user of the config does not need to know anything about the auth etc. details.
   */
  protected createTemporaryKubeconfig(): string {
    fs.ensureDir(this.configDir);
    const path = `${this.configDir}/${randomFileName("kubeconfig")}`;
    const { contextName, kubeAuthProxyUrl } = this.cluster;
    const kubeConfig = this.loadConfig();
    kubeConfig.clusters = [
      {
        name: contextName,
        server: kubeAuthProxyUrl,
        skipTLSVerify: true,
      }
    ];
    kubeConfig.users = [
      { name: "proxy" },
    ];
    kubeConfig.currentContext = contextName;
    kubeConfig.contexts = [
      {
        user: "proxy",
        name: contextName,
        cluster: contextName,
      }
    ];
    fs.writeFileSync(path, dumpConfigYaml(kubeConfig));
    logger.info(`Created temp kube-config file for context "${this.cluster.contextName}" at "${path}"`);
    return path;
  }

  unlink() {
    logger.debug('Deleting temporary kubeconfig: ' + this.tempFile)
    fs.unlinkSync(this.tempFile)
  }
}

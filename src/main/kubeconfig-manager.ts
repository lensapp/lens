import type { ContextHandler } from "./context-handler";
import type { Cluster } from "./cluster"
import { app } from "electron"
import fs from "fs-extra"
import { randomFileName } from "../common/utils"
import { dumpConfigYaml, loadConfig } from "./k8s"
import logger from "./logger"

export class KubeconfigManager {
  protected configDir = app.getPath("temp")
  protected tempFile: string

  constructor(protected cluster: Cluster, protected contextHandler: ContextHandler) {
    this.init();
  }

  protected async init() {
    await this.contextHandler.ensurePort();
    this.tempFile = await this.createTemporaryKubeconfig();
  }

  getPath() {
    return this.tempFile;
  }

  /**
   * Creates new "temporary" kubeconfig that point to the kubectl-proxy.
   * This way any user of the config does not need to know anything about the auth etc. details.
   */
  protected async createTemporaryKubeconfig(): Promise<string> {
    fs.ensureDir(this.configDir);
    const path = `${this.configDir}/${randomFileName("kubeconfig")}`;
    const { contextName, kubeConfigPath } = this.cluster;
    const kubeConfig = loadConfig(kubeConfigPath);
    kubeConfig.clusters = [
      {
        name: contextName,
        server: await this.contextHandler.getApiTargetUrl(),
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
        namespace: kubeConfig.getContextObject(contextName).namespace,
      }
    ];
    logger.info(`Creating temp config for context "${contextName}" at "${path}"`);
    fs.writeFileSync(path, dumpConfigYaml(kubeConfig));
    return path;
  }

  unlink() {
    logger.debug('Deleting temporary kubeconfig: ' + this.tempFile)
    fs.unlinkSync(this.tempFile)
  }
}

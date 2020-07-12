import type { KubeConfig } from "@kubernetes/client-node";
import type { ContextHandler } from "./context-handler";
import type { Cluster } from "./cluster"
import { app } from "electron"
import path from "path"
import fs from "fs-extra"
import { dumpConfigYaml, loadConfig } from "./k8s"
import logger from "./logger"

export class KubeconfigManager {
  protected configDir = app.getPath("temp")
  protected tempFile: string;

  constructor(protected cluster: Cluster, protected contextHandler: ContextHandler) {
    this.init();
  }

  protected async init() {
    try {
      await this.contextHandler.ensurePort();
      await this.createProxyKubeconfig();
    } catch (err) {
      logger.error(`Failed to created temp config`, { err })
    }
  }

  getPath() {
    return this.tempFile;
  }

  /**
   * Creates new "temporary" kubeconfig that point to the kubectl-proxy.
   * This way any user of the config does not need to know anything about the auth etc. details.
   */
  protected async createProxyKubeconfig(): Promise<string> {
    fs.ensureDir(this.configDir);
    const { contextName, kubeConfigPath, id } = this.cluster;
    const tempFile = path.join(this.configDir, `kubeconfig-${id}`);
    const kubeConfig = loadConfig(kubeConfigPath);
    const proxyUser = "proxy";
    const proxyConfig: Partial<KubeConfig> = {
      currentContext: contextName,
      clusters: [
        {
          name: contextName,
          server: await this.contextHandler.getApiTargetUrl(),
          skipTLSVerify: undefined,
        }
      ],
      users: [
        { name: proxyUser },
      ],
      contexts: [
        {
          user: proxyUser,
          name: contextName,
          cluster: contextName,
          namespace: kubeConfig.getContextObject(contextName).namespace,
        }
      ]
    };
    const tempConfigYaml = dumpConfigYaml(proxyConfig);
    fs.writeFileSync(tempFile, tempConfigYaml);
    logger.info(`Created temp kubeconfig "${contextName}" at "${tempFile}": \n${tempConfigYaml}`);
    this.tempFile = tempFile;
    return tempFile;
  }

  unlink() {
    logger.debug('Deleting temporary kubeconfig: ' + this.tempFile)
    fs.unlinkSync(this.tempFile)
  }
}

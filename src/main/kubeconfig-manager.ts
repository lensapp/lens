import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "./cluster"
import { app } from "electron"
import path from "path"
import fs from "fs-extra"
import { dumpConfigYaml, loadConfig } from "./k8s"
import logger from "./logger"

export class KubeconfigManager {
  protected configDir = app.getPath("temp")
  protected tempFile: string;

  constructor(protected cluster: Cluster) {
    if(!cluster.kubeAuthProxyUrl) {
      throw new Error(`Cluster's auth proxy url must be initialized`)
    }
    if (!cluster.contextHandler.proxyPort) {
      throw new Error("Context-handler proxy port must be resolved")
    }
    this.init();
  }

  protected async init() {
    try {
      await this.createProxyKubeconfig();
    } catch (err) {
      logger.error(`Failed to created temp config for auth-proxy`, { err })
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
    const { configDir, cluster } = this;
    const { contextName, kubeConfigPath, id } = cluster;
    const tempFile = path.join(configDir, `kubeconfig-${id}`);
    const kubeConfig = loadConfig(kubeConfigPath);
    const proxyUser = "proxy";
    const proxyConfig: Partial<KubeConfig> = {
      currentContext: contextName,
      clusters: [
        {
          name: contextName,
          server: cluster.kubeAuthProxyUrl,
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
    const configYaml = dumpConfigYaml(proxyConfig);
    fs.ensureDir(path.dirname(tempFile));
    fs.writeFileSync(tempFile, configYaml);
    logger.debug(`Created temp kubeconfig "${contextName}" at "${tempFile}": \n${configYaml}`);
    this.tempFile = tempFile;
    return tempFile;
  }

  unlink() {
    logger.debug('Deleting temporary kubeconfig: ' + this.tempFile)
    fs.unlinkSync(this.tempFile)
  }
}

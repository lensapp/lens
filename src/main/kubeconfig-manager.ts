import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "./cluster"
import type { ContextHandler } from "./context-handler";
import { app } from "electron"
import path from "path"
import fs from "fs-extra"
import { dumpConfigYaml, loadConfig } from "../common/kube-helpers"
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
    const { configDir, cluster, contextHandler } = this;
    const { contextName, kubeConfigPath, id } = cluster;
    const tempFile = path.join(configDir, `kubeconfig-${id}`);
    const kubeConfig = loadConfig(kubeConfigPath);
    const proxyConfig: Partial<KubeConfig> = {
      currentContext: contextName,
      clusters: [
        {
          name: contextName,
          server: await contextHandler.resolveAuthProxyUrl(),
          skipTLSVerify: undefined,
        }
      ],
      users: [
        { name: "proxy" },
      ],
      contexts: [
        {
          user: "proxy",
          name: contextName,
          cluster: contextName,
          namespace: kubeConfig.getContextObject(contextName).namespace,
        }
      ]
    };

    // write
    const configYaml = dumpConfigYaml(proxyConfig);
    fs.ensureDir(path.dirname(tempFile));
    fs.writeFileSync(tempFile, configYaml, { mode: 0o600 });
    this.tempFile = tempFile;
    logger.debug(`Created temp kubeconfig "${contextName}" at "${tempFile}": \n${configYaml}`);
    return tempFile;
  }

  unlink() {
    logger.info('Deleting temporary kubeconfig: ' + this.tempFile)
    fs.unlinkSync(this.tempFile)
  }
}

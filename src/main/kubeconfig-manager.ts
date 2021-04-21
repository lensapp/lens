import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "./cluster";
import type { ContextHandler } from "./context-handler";
import { app } from "electron";
import path from "path";
import fs from "fs-extra";
import { dumpConfigYaml, loadConfig } from "../common/kube-helpers";
import logger from "./logger";

export class KubeconfigManager {
  protected configDir = app.getPath("temp");
  protected tempFile: string = null;

  constructor(protected cluster: Cluster, protected contextHandler: ContextHandler, protected port: number) { }

  async getPath(): Promise<string> {
    if (this.tempFile === undefined) {
      throw new Error("kubeconfig is already unlinked");
    }

    if (!this.tempFile) {
      await this.init();
    }

    // create proxy kubeconfig if it is removed without unlink called
    if (!(await fs.pathExists(this.tempFile))) {
      try {
        this.tempFile = await this.createProxyKubeconfig();
      } catch (err) {
        logger.error(`Failed to created temp config for auth-proxy`, { err });
      }
    }

    return this.tempFile;
  }

  async unlink() {
    if (!this.tempFile) {
      return;
    }

    logger.info(`Deleting temporary kubeconfig: ${this.tempFile}`);
    await fs.unlink(this.tempFile);
    this.tempFile = undefined;
  }

  protected async init() {
    try {
      await this.contextHandler.ensurePort();
      this.tempFile = await this.createProxyKubeconfig();
    } catch (err) {
      logger.error(`Failed to created temp config for auth-proxy`, { err });
    }
  }

  protected resolveProxyUrl() {
    return `http://127.0.0.1:${this.port}/${this.cluster.id}`;
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
    const proxyConfig: Partial<KubeConfig> = {
      currentContext: contextName,
      clusters: [
        {
          name: contextName,
          server: this.resolveProxyUrl(),
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

    await fs.ensureDir(path.dirname(tempFile));
    await fs.writeFile(tempFile, configYaml, { mode: 0o600 });
    logger.debug(`Created temp kubeconfig "${contextName}" at "${tempFile}": \n${configYaml}`);

    return tempFile;
  }
}

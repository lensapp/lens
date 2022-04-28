/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../../common/cluster/cluster";
import path from "path";
import fs from "fs-extra";
import { dumpConfigYaml } from "../../common/kube-helpers";
import logger from "../logger";
import type { IObservableValue } from "mobx";
import { waitUntilSet } from "../../common/utils/wait-observable-value";

export interface KubeconfigManagerDependencies {
  readonly directoryForTemp: string;
  readonly proxyPort: IObservableValue<number | undefined>;
}

export class KubeconfigManager {
  /**
   * The path to the temp config file
   *
   * - if `string` then path
   * - if `null` then not yet created
   * - if `undefined` then unlinked by calling `clear()`
   */
  protected tempFilePath: string | null | undefined = null;

  constructor(protected readonly dependencies: KubeconfigManagerDependencies, protected readonly cluster: Cluster) {}

  /**
   *
   * @returns The path to the temporary kubeconfig
   */
  async getPath(): Promise<string> {
    if (this.tempFilePath === undefined) {
      throw new Error("kubeconfig is already unlinked");
    }

    if (this.tempFilePath === null || !(await fs.pathExists(this.tempFilePath))) {
      await this.ensureFile();
    }

    return this.tempFilePath;
  }

  /**
   * Deletes the temporary kubeconfig file
   */
  async clear(): Promise<void> {
    if (!this.tempFilePath) {
      return;
    }

    logger.info(`[KUBECONFIG-MANAGER]: Deleting temporary kubeconfig: ${this.tempFilePath}`);

    try {
      await fs.unlink(this.tempFilePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    } finally {
      this.tempFilePath = undefined;
    }
  }

  protected async ensureFile() {
    try {
      await this.cluster.contextHandler.ensureServer();
      this.tempFilePath = await this.createProxyKubeconfig();
    } catch (error) {
      throw new Error(`Failed to creat temp config for auth-proxy: ${error}`);
    }
  }

  /**
   * Creates new "temporary" kubeconfig that point to the kubectl-proxy.
   * This way any user of the config does not need to know anything about the auth etc. details.
   */
  protected async createProxyKubeconfig(): Promise<string> {
    const { cluster } = this;
    const { contextName, id } = cluster;
    const tempFile = path.join(
      this.dependencies.directoryForTemp,
      `kubeconfig-${id}`,
    );
    const kubeConfig = await cluster.getKubeconfig();
    const proxyPort = await waitUntilSet(this.dependencies.proxyPort);
    const proxyConfig: Partial<KubeConfig> = {
      currentContext: contextName,
      clusters: [
        {
          name: contextName,
          server: `http://127.0.0.1:${proxyPort}/${this.cluster.id}`,
          skipTLSVerify: undefined,
        },
      ],
      users: [
        { name: "proxy" },
      ],
      contexts: [
        {
          user: "proxy",
          name: contextName,
          cluster: contextName,
          namespace: cluster.defaultNamespace || kubeConfig.getContextObject(contextName).namespace,
        },
      ],
    };
    // write
    const configYaml = dumpConfigYaml(proxyConfig);

    await fs.ensureDir(path.dirname(tempFile));
    await fs.writeFile(tempFile, configYaml, { mode: 0o600 });
    logger.debug(`[KUBECONFIG-MANAGER]: Created temp kubeconfig "${contextName}" at "${tempFile}": \n${configYaml}`);

    return tempFile;
  }
}

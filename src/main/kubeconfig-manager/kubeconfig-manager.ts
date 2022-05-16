/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../../common/cluster/cluster";
import type { ClusterContextHandler } from "../context-handler/context-handler";
import path from "path";
import fs from "fs-extra";
import { dumpConfigYaml } from "../../common/kube-helpers";
import logger from "../logger";
import { LensProxy } from "../lens-proxy";
import { isErrnoException } from "../../common/utils";
import type { PartialDeep } from "type-fest";
import type { Logger } from "../../common/logger";

export interface KubeconfigManagerDependencies {
  readonly directoryForTemp: string;
  readonly logger: Logger;
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

  protected readonly contextHandler: ClusterContextHandler;

  constructor(private readonly dependencies: KubeconfigManagerDependencies, protected cluster: Cluster) {
    this.contextHandler = cluster.contextHandler;
  }

  /**
   *
   * @returns The path to the temporary kubeconfig
   */
  async getPath(): Promise<string> {
    if (this.tempFilePath === undefined) {
      throw new Error("kubeconfig is already unlinked");
    }

    if (this.tempFilePath === null || !(await fs.pathExists(this.tempFilePath))) {
      return await this.ensureFile();
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
      if (isErrnoException(error) && error.code !== "ENOENT") {
        throw error;
      }
    } finally {
      this.tempFilePath = undefined;
    }
  }

  protected async ensureFile() {
    try {
      await this.contextHandler.ensureServer();

      return this.tempFilePath = await this.createProxyKubeconfig();
    } catch (error) {
      throw Object.assign(new Error("Failed to creat temp config for auth-proxy"), { cause: error });
    }
  }

  get resolveProxyUrl() {
    return `http://127.0.0.1:${LensProxy.getInstance().port}/${this.cluster.id}`;
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
    const proxyConfig: PartialDeep<KubeConfig> = {
      currentContext: contextName,
      clusters: [
        {
          name: contextName,
          server: this.resolveProxyUrl,
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
          namespace: cluster.defaultNamespace || kubeConfig.getContextObject(contextName)?.namespace,
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

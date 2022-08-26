/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../../common/cluster/cluster";
import type { ClusterContextHandler } from "../context-handler/context-handler";
import { dumpConfigYaml } from "../../common/kube-helpers";
import { isErrnoException } from "../../common/utils";
import type { PartialDeep } from "type-fest";
import type { Logger } from "../../common/logger";
import type { JoinPaths } from "../../common/path/join-paths.injectable";
import type { GetDirnameOfPath } from "../../common/path/get-dirname.injectable";
import type { PathExists } from "../../common/fs/path-exists.injectable";
import type { DeleteFile } from "../../common/fs/delete-file.injectable";
import type { WriteFile } from "../../common/fs/write-file.injectable";

export interface KubeconfigManagerDependencies {
  readonly directoryForTemp: string;
  readonly logger: Logger;
  readonly lensProxyPort: { get: () => number };
  joinPaths: JoinPaths;
  getDirnameOfPath: GetDirnameOfPath;
  pathExists: PathExists;
  deleteFile: DeleteFile;
  writeFile: WriteFile;
}

export class KubeconfigManager {
  /**
   * The path to the temp config file
   *
   * - if `string` then path
   * - if `null` then not yet created or was cleared
   */
  protected tempFilePath: string | null = null;

  protected readonly contextHandler: ClusterContextHandler;

  constructor(private readonly dependencies: KubeconfigManagerDependencies, protected cluster: Cluster) {
    this.contextHandler = cluster.contextHandler;
  }

  /**
   *
   * @returns The path to the temporary kubeconfig
   */
  async getPath(): Promise<string> {
    if (this.tempFilePath === null || !(await this.dependencies.pathExists(this.tempFilePath))) {
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

    this.dependencies.logger.info(`[KUBECONFIG-MANAGER]: Deleting temporary kubeconfig: ${this.tempFilePath}`);

    try {
      await this.dependencies.deleteFile(this.tempFilePath);
    } catch (error) {
      if (isErrnoException(error) && error.code !== "ENOENT") {
        throw error;
      }
    } finally {
      this.tempFilePath = null;
    }
  }

  protected async ensureFile() {
    try {
      await this.contextHandler.ensureServer();

      return this.tempFilePath = await this.createProxyKubeconfig();
    } catch (error) {
      throw new Error(`Failed to creat temp config for auth-proxy: ${error}`);
    }
  }

  get resolveProxyUrl() {
    return `http://127.0.0.1:${this.dependencies.lensProxyPort.get()}/${this.cluster.id}`;
  }

  /**
   * Creates new "temporary" kubeconfig that point to the kubectl-proxy.
   * This way any user of the config does not need to know anything about the auth etc. details.
   */
  protected async createProxyKubeconfig(): Promise<string> {
    const { cluster } = this;
    const { contextName, id } = cluster;
    const tempFile = this.dependencies.joinPaths(
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

    await this.dependencies.writeFile(tempFile, configYaml, { mode: 0o600 });
    this.dependencies.logger.debug(`[KUBECONFIG-MANAGER]: Created temp kubeconfig "${contextName}" at "${tempFile}": \n${configYaml}`);

    return tempFile;
  }
}

/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "./cluster";
import type { ContextHandler } from "./context-handler";
import path from "path";
import fs from "fs-extra";
import { dumpConfigYaml } from "../common/kube-helpers";
import logger from "../common/logger";
import { LensProxy } from "./lens-proxy";
import { AppPaths } from "../common/app-paths";

export class KubeconfigManager {
  /**
   * The path to the temp config file
   *
   * - if `string` then path
   * - if `null` then not yet created
   * - if `undefined` then unlinked by calling `clear()`
   */
  protected tempFilePath: string | null | undefined = null;

  constructor(protected cluster: Cluster, protected contextHandler: ContextHandler) { }

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
      await this.contextHandler.ensureServer();
      this.tempFilePath = await this.createProxyKubeconfig();
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
    const tempFile = path.join(AppPaths.get("temp"), `kubeconfig-${id}`);
    const kubeConfig = await cluster.getKubeconfig();
    const proxyConfig: Partial<KubeConfig> = {
      currentContext: contextName,
      clusters: [
        {
          name: contextName,
          server: this.resolveProxyUrl,
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

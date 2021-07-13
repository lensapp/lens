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

import type { Cluster } from "./cluster";
import type { KubernetesObject } from "@kubernetes/client-node";
import fse from "fs-extra";
import * as yaml from "js-yaml";
import path from "path";
import * as tempy from "tempy";
import logger from "./logger";
import { appEventBus } from "../common/event-bus";
import { cloneJsonObject } from "../common/utils";
import { inspect } from "util";
import { promiseExec } from "./promise-exec";

function sanitize(raw: string): string {
  return inspect(raw, false, undefined, false);
}

function sanitizeObject(resource: KubernetesObject | any) {
  resource = cloneJsonObject(resource);

  delete resource.status;
  delete resource.metadata?.resourceVersion;
  delete resource.metadata?.annotations?.["kubectl.kubernetes.io/last-applied-configuration"];

  return resource;
}

export class ResourceApplier {
  constructor(protected cluster: Cluster) {}

  async apply(resource: KubernetesObject | any): Promise<string> {
    appEventBus.emit({ name: "resource", action: "apply" });

    return this.kubectlApply(yaml.safeDump(sanitizeObject(resource)));
  }

  protected async kubectlApply(content: string): Promise<string> {
    const kubectl = await this.cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();
    const proxyKubeconfigPath = await this.cluster.getProxyKubeconfigPath();
    const fileName = tempy.file({ name: "resource.yaml" });

    await fse.writeFile(fileName, content);

    const cmd = [
      sanitize(kubectlPath),
      "apply",
      "--kubeconfig", sanitize(proxyKubeconfigPath),
      "-o", "json",
      "-f", sanitize(fileName),
    ].join(" ");

    logger.debug(`[RESOURCE-APPLIER]: shooting manifests with: ${cmd}`);

    const execEnv: NodeJS.ProcessEnv = Object.assign({}, process.env);
    const httpsProxy = this.cluster.preferences?.httpsProxy;

    if (httpsProxy) {
      execEnv["HTTPS_PROXY"] = httpsProxy;
    }

    try {
      const { stdout } = await promiseExec(cmd, { env: execEnv });

      return JSON.parse(stdout);
    } catch (error) {
      throw error?.stderr ?? error;
    } finally {
      await fse.unlink(fileName);
    }
  }

  public async kubectlApplyAll(resources: string[], extraArgs = ["-o", "json"]): Promise<string> {
    return this.kubectlCmdAll("apply", resources, extraArgs);
  }

  public async kubectlDeleteAll(resources: string[], extraArgs?: string[]): Promise<string> {
    return this.kubectlCmdAll("delete", resources, extraArgs);
  }

  protected async kubectlCmdAll(subCmd: string, resources: string[], args: string[] = []): Promise<string> {
    const kubectl = await this.cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();
    const proxyKubeconfigPath = await this.cluster.getProxyKubeconfigPath();
    const tmpDir = tempy.directory();

    await Promise.all(
      resources.map((resource, index) => fse.writeFile(path.join(tmpDir, `${index}.yaml`), resource))
    );

    args.unshift(
      sanitize(kubectlPath),
      subCmd,
      "--kubeconfig", sanitize(proxyKubeconfigPath),
    );

    const cmd = args.join(" ");

    logger.info(`[RESOURCE-APPLIER] running cmd ${cmd}`);

    try {
      const { stdout } = await promiseExec(cmd);

      return stdout;
    } catch (error) {
      logger.error(`[RESOURCE-APPLIER] cmd errored: ${error}`);

      const splitError = String(error).split(`.yaml": `);

      return splitError[1] ?? error;
    }
  }
}

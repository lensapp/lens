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
import { exec } from "child_process";
import fs from "fs";
import * as yaml from "js-yaml";
import path from "path";
import tempy from "tempy";
import logger from "./logger";
import { appEventBus } from "../common/event-bus";
import { cloneJsonObject } from "../common/utils";

export class ResourceApplier {
  constructor(protected cluster: Cluster) {
  }

  async apply(resource: KubernetesObject | any): Promise<string> {
    resource = this.sanitizeObject(resource);
    appEventBus.emit({ name: "resource", action: "apply" });

    return await this.kubectlApply(yaml.safeDump(resource));
  }

  protected async kubectlApply(content: string): Promise<string> {
    const kubectl = await this.cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();
    const proxyKubeconfigPath = await this.cluster.getProxyKubeconfigPath();

    return new Promise<string>((resolve, reject) => {
      const fileName = tempy.file({ name: "resource.yaml" });

      fs.writeFileSync(fileName, content);
      const cmd = `"${kubectlPath}" apply --kubeconfig "${proxyKubeconfigPath}" -o json -f "${fileName}"`;

      logger.debug(`shooting manifests with: ${cmd}`);
      const execEnv: NodeJS.ProcessEnv = Object.assign({}, process.env);
      const httpsProxy = this.cluster.preferences?.httpsProxy;

      if (httpsProxy) {
        execEnv["HTTPS_PROXY"] = httpsProxy;
      }
      exec(cmd, { env: execEnv },
        (error, stdout, stderr) => {
          if (stderr != "") {
            fs.unlinkSync(fileName);
            reject(stderr);

            return;
          }
          fs.unlinkSync(fileName);
          resolve(JSON.parse(stdout));
        });
    });
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

    return new Promise((resolve, reject) => {
      const tmpDir = tempy.directory();

      // Dump each resource into tmpDir
      resources.forEach((resource, index) => {
        fs.writeFileSync(path.join(tmpDir, `${index}.yaml`), resource);
      });
      args.push("-f", `"${tmpDir}"`);
      const cmd = `"${kubectlPath}" ${subCmd} --kubeconfig "${proxyKubeconfigPath}" ${args.join(" ")}`;

      logger.info(`[RESOURCE-APPLIER] running cmd ${cmd}`);
      exec(cmd, (error, stdout) => {
        if (error) {
          logger.error(`[RESOURCE-APPLIER] cmd errored: ${error}`);
          const splitError = error.toString().split(`.yaml": `);

          if (splitError[1]) {
            reject(splitError[1]);
          } else {
            reject(error);
          }

          return;
        }

        resolve(stdout);
      });
    });
  }

  protected sanitizeObject(resource: KubernetesObject | any) {
    resource = cloneJsonObject(resource);
    delete resource.status;
    delete resource.metadata?.resourceVersion;
    const annotations = resource.metadata?.annotations;

    if (annotations) {
      delete annotations["kubectl.kubernetes.io/last-applied-configuration"];
    }

    return resource;
  }
}

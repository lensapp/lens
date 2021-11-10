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
import fse from "fs-extra";
import path from "path";
import hb from "handlebars";
import { ResourceApplier } from "../../main/resource-applier";
import type { KubernetesCluster } from "../catalog-entities";
import logger from "../../common/logger";
import { app } from "electron";
import { requestMain } from "../ipc";
import { clusterKubectlApplyAllHandler, clusterKubectlDeleteAllHandler } from "../cluster-ipc";
import { ClusterStore } from "../cluster-store";
import yaml from "js-yaml";
import { productName } from "../vars";

export class ResourceStack {
  constructor(protected cluster: KubernetesCluster, protected name: string) {}

  /**
   *
   * @param folderPath folder path that is searched for files defining kubernetes resources.
   * @param templateContext sets the template parameters that are to be applied to any templated kubernetes resources that are to be applied.
   */
  async kubectlApplyFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string> {
    const resources = await this.renderTemplates(folderPath, templateContext);

    return this.applyResources(resources, extraArgs);
  }

  /**
   *
   * @param folderPath folder path that is searched for files defining kubernetes resources.
   * @param templateContext sets the template parameters that are to be applied to any templated kubernetes resources that are to be applied.
   */
  async kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string> {
    const resources = await this.renderTemplates(folderPath, templateContext);

    return this.deleteResources(resources, extraArgs);
  }

  protected async applyResources(resources: string[], extraArgs?: string[]): Promise<string> {
    const clusterModel = ClusterStore.getInstance().getById(this.cluster.metadata.uid);

    if (!clusterModel) {
      throw new Error(`cluster not found`);
    }

    let kubectlArgs = extraArgs || [];

    kubectlArgs = this.appendKubectlArgs(kubectlArgs);

    if (app) {
      return await new ResourceApplier(clusterModel).kubectlApplyAll(resources, kubectlArgs);
    } else {
      const response = await requestMain(clusterKubectlApplyAllHandler, this.cluster.metadata.uid, resources, kubectlArgs);

      if (response.stderr) {
        throw new Error(response.stderr);
      }

      return response.stdout;
    }
  }

  protected async deleteResources(resources: string[], extraArgs?: string[]): Promise<string> {
    const clusterModel = ClusterStore.getInstance().getById(this.cluster.metadata.uid);

    if (!clusterModel) {
      throw new Error(`cluster not found`);
    }

    let kubectlArgs = extraArgs || [];

    kubectlArgs = this.appendKubectlArgs(kubectlArgs);

    if (app) {
      return await new ResourceApplier(clusterModel).kubectlDeleteAll(resources, kubectlArgs);
    } else {
      const response = await requestMain(clusterKubectlDeleteAllHandler, this.cluster.metadata.uid, resources, kubectlArgs);

      if (response.stderr) {
        throw new Error(response.stderr);
      }

      return response.stdout;
    }
  }

  protected appendKubectlArgs(kubectlArgs: string[]) {
    if (!kubectlArgs.includes("-l") && !kubectlArgs.includes("--label")) {
      return kubectlArgs.concat(["-l", `app.kubernetes.io/name=${this.name}`]);
    }

    return kubectlArgs;
  }

  protected async renderTemplates(folderPath: string, templateContext: any): Promise<string[]> {
    const resources: string[] = [];

    logger.info(`[RESOURCE-STACK]: render templates from ${folderPath}`);
    const files = await fse.readdir(folderPath);

    for(const filename of files) {
      const file = path.join(folderPath, filename);
      const raw = await fse.readFile(file);
      const data = (
        filename.endsWith(".hb")
          ? hb.compile(raw.toString())(templateContext)
          : raw.toString()
      ).trim();

      if (!data) {
        continue;
      }

      for (const entry of yaml.loadAll(data)) {
        if (typeof entry !== "object" || !entry) {
          continue;
        }

        const resource = entry as Record<string, any>;

        if (typeof resource.metadata === "object") {
          resource.metadata.labels ??= {};
          resource.metadata.labels["app.kubernetes.io/name"] = this.name;
          resource.metadata.labels["app.kubernetes.io/managed-by"] = productName;
          resource.metadata.labels["app.kubernetes.io/created-by"] = "resource-stack";
        }

        resources.push(yaml.dump(resource));
      }
    }

    return resources;
  }
}

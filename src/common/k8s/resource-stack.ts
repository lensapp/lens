import fs from "fs";
import path from "path";
import hb from "handlebars";
import { ResourceApplier } from "../../main/resource-applier";
import { KubernetesCluster } from "../catalog-entities";
import logger from "../../main/logger";
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
    const resources = this.renderTemplates(folderPath, templateContext);

    return this.applyResources(resources, extraArgs);
  }

  /**
   *
   * @param folderPath folder path that is searched for files defining kubernetes resources.
   * @param templateContext sets the template parameters that are to be applied to any templated kubernetes resources that are to be applied.
   */
  async kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string> {
    const resources = this.renderTemplates(folderPath, templateContext);

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

  protected renderTemplates(folderPath: string, templateContext: any): string[] {
    const resources: string[] = [];

    logger.info(`[RESOURCE-STACK]: render templates from ${folderPath}`);
    fs.readdirSync(folderPath).forEach(filename => {
      const file = path.join(folderPath, filename);
      const raw = fs.readFileSync(file);
      let resourceData: string;

      if (filename.endsWith(".hb")) {
        const template = hb.compile(raw.toString());

        resourceData = template(templateContext);
      } else {
        resourceData = raw.toString();
      }

      if (!resourceData.trim()) return;

      const resourceArray = yaml.safeLoadAll(resourceData.toString());

      resourceArray.forEach((resource) => {
        if (resource?.metadata) {
          resource.metadata.labels ||= {};
          resource.metadata.labels["app.kubernetes.io/name"] = this.name;
          resource.metadata.labels["app.kubernetes.io/managed-by"] = productName;
          resource.metadata.labels["app.kubernetes.io/created-by"] = "resource-stack";
        }

        resources.push(yaml.safeDump(resource));
      });
    });

    return resources;
  }
}

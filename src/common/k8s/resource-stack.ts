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

export class ResourceStack {
  constructor(protected cluster: KubernetesCluster) {}

  /**
   *
   * @param folderPath folder path that is searched for files defining kubernetes resources.
   * @param templateContext sets the template parameters that are to be applied to any templated kubernetes resources that are to be applied.
   */
  async kubectlApplyFolder(folderPath: string, templateContext?: any): Promise<string> {
    const resources = this.renderTemplates(folderPath, templateContext);

    return this.applyResources(resources);
  }

  /**
   *
   * @param folderPath folder path that is searched for files defining kubernetes resources.
   * @param templateContext sets the template parameters that are to be applied to any templated kubernetes resources that are to be applied.
   */
  async kubectlDeleteFolder(folderPath: string, templateContext?: any): Promise<string> {
    const resources = this.renderTemplates(folderPath, templateContext);

    return this.deleteResources(resources);
  }

  protected async applyResources(resources: string[]): Promise<string> {
    const clusterModel = ClusterStore.getInstance().getById(this.cluster.metadata.uid);

    if (!clusterModel) {
      throw new Error(`cluster not found`);
    }

    if (app) {
      return await new ResourceApplier(clusterModel).kubectlApplyAll(resources);
    } else {
      const response = await requestMain(clusterKubectlApplyAllHandler, this.cluster.metadata.uid, resources);

      if (response.stderr) {
        throw new Error(response.stderr);
      }

      return response.stdout;
    }
  }

  protected async deleteResources(resources: string[]): Promise<string> {
    const clusterModel = ClusterStore.getInstance().getById(this.cluster.metadata.uid);

    if (!clusterModel) {
      throw new Error(`cluster not found`);
    }

    if (app) {
      return await new ResourceApplier(clusterModel).kubectlDeleteAll(resources);
    } else {
      const response = await requestMain(clusterKubectlDeleteAllHandler, this.cluster.metadata.uid, resources);

      if (response.stderr) {
        throw new Error(response.stderr);
      }

      return response.stdout;
    }
  }

  protected renderTemplates(folderPath: string, templateContext: any): string[] {
    const resources: string[] = [];

    logger.info(`[RESOURCE-STACK]: render templates from ${folderPath}`);
    fs.readdirSync(folderPath).forEach(filename => {
      const file = path.join(folderPath, filename);
      const raw = fs.readFileSync(file);

      if (filename.endsWith(".hb")) {
        const template = hb.compile(raw.toString());

        resources.push(template(templateContext));
      } else {
        resources.push(raw.toString());
      }
    });

    return resources;
  }
}

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import fse from "fs-extra";
import path from "path";
import hb from "handlebars";
import type { KubernetesCluster } from "../catalog-entities";
import logger from "../../main/logger";
import { app } from "electron";
import { ClusterStore } from "../cluster-store/cluster-store";
import yaml from "js-yaml";
import { requestKubectlApplyAll, requestKubectlDeleteAll } from "../../renderer/ipc";
import { getLegacyGlobalDiForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";
import productNameInjectable from "../vars/product-name.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import createResourceApplierInjectable from "../../main/resource-applier/create-resource-applier.injectable";

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
    const clusterModel = ClusterStore.getInstance().getById(this.cluster.getId());

    if (!clusterModel) {
      throw new Error(`cluster not found`);
    }

    let kubectlArgs = extraArgs || [];

    kubectlArgs = this.appendKubectlArgs(kubectlArgs);

    if (app) {
      const createResourceApplier = asLegacyGlobalFunctionForExtensionApi(createResourceApplierInjectable);

      return await createResourceApplier(clusterModel).kubectlApplyAll(resources, kubectlArgs);
    } else {
      const response = await requestKubectlApplyAll(this.cluster.getId(), resources, kubectlArgs);

      if (response.stderr) {
        throw new Error(response.stderr);
      }

      return response.stdout ?? "";
    }
  }

  protected async deleteResources(resources: string[], extraArgs?: string[]): Promise<string> {
    const clusterModel = ClusterStore.getInstance().getById(this.cluster.getId());

    if (!clusterModel) {
      throw new Error(`cluster not found`);
    }

    let kubectlArgs = extraArgs || [];

    kubectlArgs = this.appendKubectlArgs(kubectlArgs);

    if (app) {
      const createResourceApplier = asLegacyGlobalFunctionForExtensionApi(createResourceApplierInjectable);

      return await createResourceApplier(clusterModel).kubectlDeleteAll(resources, kubectlArgs);
    } else {
      const response = await requestKubectlDeleteAll(this.cluster.getId(), resources, kubectlArgs);

      if (response.stderr) {
        throw new Error(response.stderr);
      }

      return response.stdout ?? "";
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
    const di = getLegacyGlobalDiForExtensionApi();
    const productName = di.inject(productNameInjectable);

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

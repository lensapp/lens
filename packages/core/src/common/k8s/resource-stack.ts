/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import hb from "handlebars";
import type { KubernetesCluster } from "../catalog-entities";
import yaml from "js-yaml";
import { getLegacyGlobalDiForExtensionApi } from "@k8slens/legacy-global-di";
import productNameInjectable from "../vars/product-name.injectable";
import type { AsyncResult } from "@k8slens/utilities";
import type { Logger } from "../logger";
import type { KubectlApplyAll, KubectlDeleteAll } from "../kube-helpers/channels";
import type { ReadDirectory } from "../fs/read-directory.injectable";
import type { JoinPaths } from "../path/join-paths.injectable";
import type { ReadFile } from "../fs/read-file.injectable";
import { hasTypedProperty, isObject } from "@k8slens/utilities";

export interface ResourceApplyingStack {
  kubectlApplyFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string>;
  kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string>;
}

export interface ResourceStackDependencies {
  readonly logger: Logger;
  kubectlApplyAll: KubectlApplyAll;
  kubectlDeleteAll: KubectlDeleteAll;
  readDirectory: ReadDirectory;
  joinPaths: JoinPaths;
  readFile: ReadFile;
}

export class ResourceStack {
  constructor(
    protected readonly dependencies: ResourceStackDependencies,
    protected readonly cluster: KubernetesCluster,
    protected readonly name: string,
  ) {}

  /**
   *
   * @param folderPath folder path that is searched for files defining kubernetes resources.
   * @param templateContext sets the template parameters that are to be applied to any templated kubernetes resources that are to be applied.
   */
  async kubectlApplyFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string> {
    const resources = await this.renderTemplates(folderPath, templateContext);
    const result = await this.applyResources(resources, extraArgs);

    if (result.callWasSuccessful) {
      return result.response;
    }

    this.dependencies.logger.warn(`[RESOURCE-STACK]: failed to apply resources: ${result.error}`);

    throw new Error(result.error);
  }

  /**
   *
   * @param folderPath folder path that is searched for files defining kubernetes resources.
   * @param templateContext sets the template parameters that are to be applied to any templated kubernetes resources that are to be applied.
   */
  async kubectlDeleteFolder(folderPath: string, templateContext?: any, extraArgs?: string[]): Promise<string> {
    const resources = await this.renderTemplates(folderPath, templateContext);
    const result = await this.deleteResources(resources, extraArgs);

    if (result.callWasSuccessful) {
      return result.response;
    }

    this.dependencies.logger.warn(`[RESOURCE-STACK]: failed to delete resources: ${result.error}`);

    return "";
  }

  protected async applyResources(resources: string[], extraArgs: string[] = []): AsyncResult<string, string> {
    const kubectlArgs = [...extraArgs, ...this.getAdditionalArgs(extraArgs)];

    return this.dependencies.kubectlApplyAll({
      clusterId: this.cluster.getId(),
      resources,
      extraArgs: kubectlArgs,
    });
  }

  protected async deleteResources(resources: string[], extraArgs: string[] = []): AsyncResult<string, string> {
    const kubectlArgs = [...extraArgs, ...this.getAdditionalArgs(extraArgs)];

    return this.dependencies.kubectlDeleteAll({
      clusterId: this.cluster.getId(),
      resources,
      extraArgs: kubectlArgs,
    });
  }

  protected getAdditionalArgs(kubectlArgs: string[]): string[] {
    if (!kubectlArgs.includes("-l") && !kubectlArgs.includes("--label")) {
      return ["-l", `app.kubernetes.io/name=${this.name}`];
    }

    return [];
  }

  protected async renderTemplates(folderPath: string, templateContext: any): Promise<string[]> {
    const resources: string[] = [];
    const di = getLegacyGlobalDiForExtensionApi();
    const productName = di.inject(productNameInjectable);

    this.dependencies.logger.info(`[RESOURCE-STACK]: render templates from ${folderPath}`);
    const files = await this.dependencies.readDirectory(folderPath);

    for (const filename of files) {
      const file = this.dependencies.joinPaths(folderPath, filename);
      const raw = await this.dependencies.readFile(file);
      const data = (
        filename.endsWith(".hb")
          ? hb.compile(raw)(templateContext)
          : raw
      ).trim();

      if (!data) {
        continue;
      }

      for (const entry of yaml.loadAll(data)) {
        if (typeof entry !== "object" || !entry) {
          continue;
        }

        if (hasTypedProperty(entry, "metadata", isObject)) {
          const labels = (entry.metadata.labels ??= {}) as Partial<Record<string, string>>;

          labels["app.kubernetes.io/name"] = this.name;
          labels["app.kubernetes.io/managed-by"] = productName;
          labels["app.kubernetes.io/created-by"] = "resource-stack";
        }

        resources.push(yaml.dump(entry));
      }
    }

    return resources;
  }
}

import fs from "fs";
import path from "path"
import hb from "handlebars"
import { observable } from "mobx"
import { ResourceApplier } from "./resource-applier"
import { Cluster } from "./cluster";
import logger from "./logger";
import { app } from "electron"
import { clusterIpc } from "../common/cluster-ipc"

export interface FeatureStatus {
  currentVersion: string;
  installed: boolean;
  latestVersion: string;
  canUpgrade: boolean;
}

export abstract class Feature {
  name: string;
  latestVersion: string;
  config: any;

  @observable status: FeatureStatus = {
    currentVersion: null,
    installed: false,
    latestVersion: null,
    canUpgrade: false
  }

  abstract async install(cluster: Cluster): Promise<void>;

  abstract async upgrade(cluster: Cluster): Promise<void>;

  abstract async uninstall(cluster: Cluster): Promise<void>;

  abstract async updateStatus(cluster: Cluster): Promise<FeatureStatus>;

  protected async applyResources(cluster: Cluster, resources: string[]) {
    if (app) {
      await new ResourceApplier(cluster).kubectlApplyAll(resources)
    } else {
      await clusterIpc.kubectlApplyAll.invokeFromRenderer(cluster.id, resources)
    }
  }

  protected renderTemplates(folderPath: string): string[] {
    const resources: string[] = [];
    logger.info(`[FEATURE]: render templates from ${folderPath}`);
    fs.readdirSync(folderPath).forEach(filename => {
      const file = path.join(folderPath, filename);
      const raw = fs.readFileSync(file);
      if (filename.endsWith('.hb')) {
        const template = hb.compile(raw.toString());
        resources.push(template(this.config));
      } else {
        resources.push(raw.toString());
      }
    });

    return resources;
  }
}

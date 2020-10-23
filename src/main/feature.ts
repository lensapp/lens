import fs from "fs";
import path from "path"
import hb from "handlebars"
import { ResourceApplier } from "./resource-applier"
import { Cluster } from "./cluster";
import logger from "./logger";
import { app, remote } from "electron"
import { clusterIpc } from "../common/cluster-ipc"

export type FeatureStatusMap = Record<string, FeatureStatus>
export type FeatureMap = Record<string, Feature>

export interface FeatureInstallRequest {
  clusterId: string;
  name: string;
  config?: any;
}

export interface FeatureStatus {
  currentVersion: string;
  installed: boolean;
  latestVersion: string;
  canUpgrade: boolean;
}

export abstract class Feature {
  public name: string;
  public latestVersion: string;
  public config: any;

  abstract async install(cluster: Cluster): Promise<void>;

  abstract async upgrade(cluster: Cluster): Promise<void>;

  abstract async uninstall(cluster: Cluster): Promise<void>;

  abstract async featureStatus(cluster: Cluster): Promise<FeatureStatus>;

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

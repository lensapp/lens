import fs from "fs";
import path from "path"
import * as hb from "handlebars"
import { ResourceApplier } from "./resource-applier"
import { KubeConfig, CoreV1Api, Watch } from "@kubernetes/client-node"
import logger from "./logger";
import { Cluster } from "./cluster";

export type FeatureStatus = {
  currentVersion: string;
  installed: boolean;
  latestVersion: string;
  canUpgrade: boolean;
  // TODO We need bunch of other stuff too: upgradeable, latestVersion, ...
};

export type FeatureStatusMap = {
  [name: string]: FeatureStatus;
}

export abstract class Feature {
  name: string;
  config: any;
  latestVersion: string;

  constructor(config: any) {
    if(config) {
      this.config = config;
    }
  }

  async install(cluster: Cluster): Promise<void> {
    // Read and process yamls through handlebar
    const resources = this.renderTemplates();
    const kubeconfigPath = cluster.kubeconfigPath();
    const resourceApplier = new ResourceApplier(cluster, kubeconfigPath)
    
    await resourceApplier.kubectlApplyAll(resources)
  }

  abstract async upgrade(cluster: Cluster): Promise<void>;

  abstract async uninstall(cluster: Cluster): Promise<boolean>;

  abstract async featureStatus(kc: KubeConfig): Promise<FeatureStatus>;

  protected async deleteNamespace(kc: KubeConfig, name: string) {
    return new Promise(async (resolve, reject) => {
      const client = kc.makeApiClient(CoreV1Api)
      const result = await client.deleteNamespace("lens-metrics", 'false', undefined, undefined, undefined, "Foreground");
      const nsVersion = result.body.metadata.resourceVersion;
      const nsWatch = new Watch(kc);
      const req = await nsWatch.watch('/api/v1/namespaces', {resourceVersion: nsVersion, fieldSelector: "metadata.name=lens-metrics"},
        (type, obj) => {
          if(type === 'DELETED') {
            logger.debug(`namespace ${name} finally gone`)
            req.abort();
            resolve()
          }
        },
        (err) => {
          if(err) {
            reject(err)
          }
        });
    });
  }

  protected renderTemplates(): string[] {
    console.log("starting to render resources...");
    const resources: string[] = [];
    fs.readdirSync(this.manifestPath()).forEach((f) => {
      const file = path.join(this.manifestPath(), f);
      console.log("processing file:", file)
      const raw = fs.readFileSync(file);
      console.log("raw file loaded");
      if(f.endsWith('.hb')) {
        console.log("processing HB template");
        const template = hb.compile(raw.toString());
        resources.push(template(this.config));
        console.log("HB template done");
      } else {
        console.log("using as raw, no HB detected");
        resources.push(raw.toString());
      }
    });

    return resources;
  }

  protected manifestPath() {
    const devPath = path.join(__dirname, "..", 'src/features', this.name);
    if(fs.existsSync(devPath)) {
      return devPath;
    }
    return path.join(__dirname, "..", 'features', this.name);
  }
}

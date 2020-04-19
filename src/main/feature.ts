import * as fs from "fs";
import * as path from "path"
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

  // TODO Return types for these?
  async install(cluster: Cluster): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      // Read and process yamls through handlebar
      const resources = this.renderTemplates();

      // Apply processed manifests
      cluster.contextHandler.withTemporaryKubeconfig(async (kubeconfigPath) => {
        const resourceApplier = new ResourceApplier(cluster, kubeconfigPath)
        try {
          await resourceApplier.kubectlApplyAll(resources)
          resolve(true)
        } catch(error) {
          reject(error)
        }
      });
    });
  }

  upgrade(): boolean {
    return true;
  }

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
    return path.join(__dirname, '..', 'features', this.name);
  }
}

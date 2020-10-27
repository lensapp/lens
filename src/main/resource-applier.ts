import type { Cluster } from "./cluster";
import { KubernetesObject } from "@kubernetes/client-node"
import { exec } from "child_process";
import fs from "fs";
import * as yaml from "js-yaml";
import path from "path";
import * as tempy from "tempy";
import logger from "./logger"
import { appEventBus } from "../common/event-bus"
import { cloneJsonObject } from "../common/utils";

export class ResourceApplier {
  constructor(protected cluster: Cluster) {
  }

  async apply(resource: KubernetesObject | any): Promise<string> {
    resource = this.sanitizeObject(resource);
    appEventBus.emit({name: "resource", action: "apply"})
    return await this.kubectlApply(yaml.safeDump(resource));
  }

  protected async kubectlApply(content: string): Promise<string> {
    const { kubeCtl } = this.cluster;
    const kubectlPath = await kubeCtl.getPath()
    return new Promise<string>((resolve, reject) => {
      const fileName = tempy.file({ name: "resource.yaml" })
      fs.writeFileSync(fileName, content)
      const cmd = `"${kubectlPath}" apply --kubeconfig "${this.cluster.getProxyKubeconfigPath()}" -o json -f "${fileName}"`
      logger.debug("shooting manifests with: " + cmd);
      const execEnv: NodeJS.ProcessEnv = Object.assign({}, process.env)
      const httpsProxy = this.cluster.preferences?.httpsProxy
      if (httpsProxy) {
        execEnv["HTTPS_PROXY"] = httpsProxy
      }
      exec(cmd, { env: execEnv },
        (error, stdout, stderr) => {
          if (stderr != "") {
            fs.unlinkSync(fileName)
            reject(stderr)
            return
          }
          fs.unlinkSync(fileName)
          resolve(JSON.parse(stdout))
        })
    })
  }

  public async kubectlApplyAll(resources: string[]): Promise<string> {
    const { kubeCtl } = this.cluster;
    const kubectlPath = await kubeCtl.getPath()
    return new Promise((resolve, reject) => {
      const tmpDir = tempy.directory()
      // Dump each resource into tmpDir
      resources.forEach((resource, index) => {
        fs.writeFileSync(path.join(tmpDir, `${index}.yaml`), resource);
      })
      const cmd = `"${kubectlPath}" apply --kubeconfig "${this.cluster.getProxyKubeconfigPath()}" -o json -f "${tmpDir}"`
      console.log("shooting manifests with:", cmd);
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject("Error applying manifests:" + error);
        }
        if (stderr != "") {
          reject(stderr)
          return
        }
        resolve(stdout)
      })
    })
  }

  protected sanitizeObject(resource: KubernetesObject | any) {
    resource = cloneJsonObject(resource);
    delete resource.status;
    delete resource.metadata?.resourceVersion;
    const annotations = resource.metadata?.annotations;
    if (annotations) {
      delete annotations['kubectl.kubernetes.io/last-applied-configuration'];
    }
    return resource;
  }
}

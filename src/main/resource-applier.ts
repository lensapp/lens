import { exec } from "child_process";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import * as tempy from "tempy";
import logger from "./logger"
import { Cluster } from "./cluster";
import { tracker } from "./tracker";

type KubeObject = {
  status: {};
  metadata?: {
    resourceVersion: number;
    annotations?: {
      "kubectl.kubernetes.io/last-applied-configuration": string;
    };
  };
}

export class ResourceApplier {
  protected kubeconfigPath: string;
  protected cluster: Cluster

  constructor(cluster: Cluster, pathToKubeconfig: string) {
    this.kubeconfigPath = pathToKubeconfig
    this.cluster = cluster
  }

  public async apply(resource: any): Promise<string>  {
    this.sanitizeObject((resource as KubeObject))
    try {
      tracker.event("resource", "apply")
      return await this.kubectlApply(yaml.safeDump(resource))
    } catch(error) {
      throw (error)
    }
  }

  protected async kubectlApply(content: string): Promise<string> {
    const kubectl = await this.cluster.kubeCtl.kubectlPath()
    return new Promise<string>((resolve, reject) => {
      const fileName = tempy.file({name: "resource.yaml"})
      fs.writeFileSync(fileName, content)
      const cmd = `"${kubectl}" apply --kubeconfig ${this.kubeconfigPath} -o json -f ${fileName}`
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
    const kubectl = await this.cluster.kubeCtl.kubectlPath()
    return new Promise<string>((resolve, reject) => {
      const tmpDir = tempy.directory()
      // Dump each resource into tmpDir
      for (const i in resources) {
        fs.writeFileSync(path.join(tmpDir, `${i}.yaml`), resources[i])
      }
      const cmd = `"${kubectl}" apply --kubeconfig ${this.kubeconfigPath} -o json -f ${tmpDir}`
      console.log("shooting manifests with:", cmd);
      exec(cmd, (error, stdout, stderr) => {
        if(error) {
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

  protected sanitizeObject(resource: KubeObject) {
    delete resource['status']
    if (resource['metadata']) {
      if (resource['metadata']['annotations'] && resource['metadata']['annotations']['kubectl.kubernetes.io/last-applied-configuration']) {
        delete resource['metadata']['annotations']['kubectl.kubernetes.io/last-applied-configuration']
      }
      delete resource['metadata']['resourceVersion']
    }
  }
}

export async function apply(cluster: Cluster, pathToKubeconfig: string, resource: any) {
  const resourceApplier = new ResourceApplier(cluster, pathToKubeconfig)
  return await resourceApplier.apply(resource)
}

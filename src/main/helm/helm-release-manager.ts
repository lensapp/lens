import * as tempy from "tempy";
import fs from "fs";
import * as yaml from "js-yaml";
import { promiseExec} from "../promise-exec";
import { helmCli } from "./helm-cli";
import { Cluster } from "../cluster";
import { toCamelCase } from "../../common/utils/camelCase";

export class HelmReleaseManager {

  public async listReleases(pathToKubeconfig: string, namespace?: string) {
    const helm = await helmCli.binaryPath();
    const namespaceFlag = namespace ? `-n ${namespace}` : "--all-namespaces";
    const { stdout } = await promiseExec(`"${helm}" ls --output json ${namespaceFlag} --kubeconfig ${pathToKubeconfig}`).catch((error) => { throw(error.stderr);});
    const output = JSON.parse(stdout);

    if (output.length == 0) {
      return output;
    }
    output.forEach((release: any, index: number) => {
      output[index] = toCamelCase(release);
    });

    return output;
  }


  public async installChart(chart: string, values: any, name: string, namespace: string, version: string, pathToKubeconfig: string){
    const helm = await helmCli.binaryPath();
    const fileName = tempy.file({name: "values.yaml"});

    await fs.promises.writeFile(fileName, yaml.safeDump(values));

    try {
      let generateName = "";

      if (!name) {
        generateName = "--generate-name";
        name = "";
      }
      const { stdout } = await promiseExec(`"${helm}" install ${name} ${chart} --version ${version} -f ${fileName} --namespace ${namespace} --kubeconfig ${pathToKubeconfig} ${generateName}`).catch((error) => { throw(error.stderr);});
      const releaseName = stdout.split("\n")[0].split(" ")[1].trim();

      return {
        log: stdout,
        release: {
          name: releaseName,
          namespace
        }
      };
    } finally {
      await fs.promises.unlink(fileName);
    }
  }

  public async upgradeRelease(name: string, chart: string, values: any, namespace: string, version: string, cluster: Cluster){
    const helm = await helmCli.binaryPath();
    const fileName = tempy.file({name: "values.yaml"});

    await fs.promises.writeFile(fileName, yaml.safeDump(values));

    try {
      const { stdout } = await promiseExec(`"${helm}" upgrade ${name} ${chart} --version ${version} -f ${fileName} --namespace ${namespace} --kubeconfig ${cluster.getProxyKubeconfigPath()}`).catch((error) => { throw(error.stderr);});

      return {
        log: stdout,
        release: this.getRelease(name, namespace, cluster)
      };
    } finally {
      await fs.promises.unlink(fileName);
    }
  }

  public async getRelease(name: string, namespace: string, cluster: Cluster) {
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" status ${name} --output json --namespace ${namespace} --kubeconfig ${cluster.getProxyKubeconfigPath()}`).catch((error) => { throw(error.stderr);});
    const release = JSON.parse(stdout);

    release.resources = await this.getResources(name, namespace, cluster);

    return release;
  }

  public async deleteRelease(name: string, namespace: string, pathToKubeconfig: string) {
    const helm = await helmCli.binaryPath();
    const { stdout  } = await promiseExec(`"${helm}" delete ${name} --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`).catch((error) => { throw(error.stderr);});

    return stdout;
  }

  public async getValues(name: string, namespace: string, pathToKubeconfig: string) {
    const helm = await helmCli.binaryPath();
    const { stdout,  } = await promiseExec(`"${helm}" get values ${name} --all --output yaml --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`).catch((error) => { throw(error.stderr);});

    return stdout;
  }

  public async getHistory(name: string, namespace: string, pathToKubeconfig: string) {
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" history ${name} --output json --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`).catch((error) => { throw(error.stderr);});

    return JSON.parse(stdout);
  }

  public async rollback(name: string, namespace: string, revision: number, pathToKubeconfig: string) {
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" rollback ${name} ${revision} --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`).catch((error) => { throw(error.stderr);});

    return stdout;
  }

  protected async getResources(name: string, namespace: string, cluster: Cluster) {
    const helm = await helmCli.binaryPath();
    const kubectl = await cluster.kubeCtl.getPath();
    const pathToKubeconfig = cluster.getProxyKubeconfigPath();
    const { stdout } = await promiseExec(`"${helm}" get manifest ${name} --namespace ${namespace} --kubeconfig ${pathToKubeconfig} | "${kubectl}" get -n ${namespace} --kubeconfig ${pathToKubeconfig} -f - -o=json`).catch(() => {
      return { stdout: JSON.stringify({items: []})};
    });

    return stdout;
  }
}

export const releaseManager = new HelmReleaseManager();

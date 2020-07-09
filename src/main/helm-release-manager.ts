import * as tempy from "tempy";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as camelcaseKeys from "camelcase-keys";
import { promiseExec} from "./promise-exec";
import { helmCli } from "./helm-cli";
import { Cluster } from "./cluster";

async function getResources(name: string, namespace: string, cluster: Cluster): Promise<string> {
  const helm = await helmCli.binaryPath();
  const kubectl = await cluster.kubeCtl.kubectlPath();
  const pathToKubeconfig = cluster.kubeconfigPath();

  try {
    const { stdout } = await promiseExec(`"${helm}" get manifest ${name} --namespace ${namespace} --kubeconfig ${pathToKubeconfig} | "${kubectl}" get -n ${namespace} --kubeconfig ${pathToKubeconfig} -f - -o=json`);
    return stdout;
  } catch (_error) {
    return JSON.stringify({ items: [] });
  }
}

export async function getRelease(name: string, namespace: string, cluster: Cluster): Promise<any> {
  const helm = await helmCli.binaryPath();
  const { stdout } = await promiseExec(`"${helm}" status ${name} --output json --namespace ${namespace} --kubeconfig ${cluster.kubeconfigPath()}`).catch((error) => {
    throw (error.stderr); 
  });
  const release = JSON.parse(stdout);
  release.resources = await getResources(name, namespace, cluster);
  return release;
}

export interface HelmResponse {
  log: string;
  release: Record<string, any>;
}

export async function listReleases(pathToKubeconfig: string, namespace?: string): Promise<any> {
  const helm = await helmCli.binaryPath();
  const namespaceFlag = namespace ? `-n ${namespace}` : "--all-namespaces";
  const { stdout } = await promiseExec(`"${helm}" ls --output json ${namespaceFlag} --kubeconfig ${pathToKubeconfig}`).catch((error) => {
    throw(error.stderr);
  });

  const output = JSON.parse(stdout);
  return output.map(camelcaseKeys);
}

export async function installChart(chart: string, values: any, name: string, namespace: string, version: string, pathToKubeconfig: string): Promise<HelmResponse> {
  const helm = await helmCli.binaryPath();
  const fileName = tempy.file({name: "values.yaml"});
  await fs.promises.writeFile(fileName, yaml.safeDump(values));
  try {
    const generateName = name ? "" : "--generate-name";
    const { stdout } = await promiseExec(`"${helm}" install ${name} ${chart} --version ${version} -f ${fileName} --namespace ${namespace} --kubeconfig ${pathToKubeconfig} ${generateName}`).catch((error) => {
      throw(error.stderr);
    });
    const releaseName = stdout.split("\n")[0].split(' ')[1].trim();
    return {
      log: stdout,
      release: {
        name: releaseName,
        namespace: namespace
      }
    };
  } finally {
    await fs.promises.unlink(fileName);
  }
}

export async function upgradeRelease(name: string, chart: string, values: any, namespace: string, version: string, cluster: Cluster): Promise<HelmResponse> {
  const helm = await helmCli.binaryPath();
  const fileName = tempy.file({name: "values.yaml"});
  await fs.promises.writeFile(fileName, yaml.safeDump(values));

  try {
    const { stdout  } = await promiseExec(`"${helm}" upgrade ${name} ${chart} --version ${version} -f ${fileName} --namespace ${namespace} --kubeconfig ${cluster.kubeconfigPath()}`).catch((error) => {
      throw(error.stderr);
    });
    return {
      log: stdout,
      release: getRelease(name, namespace, cluster)
    };
  } finally {
    await fs.promises.unlink(fileName);
  }
}

export async function deleteRelease(name: string, namespace: string, pathToKubeconfig: string): Promise<string> {
  const helm = await helmCli.binaryPath();
  const { stdout } = await promiseExec(`"${helm}" delete ${name} --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`).catch((error) => {
    throw(error.stderr);
  });

  return stdout;
}

export async function getValues(name: string, namespace: string, pathToKubeconfig: string): Promise<string> {
  const helm = await helmCli.binaryPath();
  const { stdout } = await promiseExec(`"${helm}" get values ${name} --all --output yaml --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`).catch((error) => {
    throw(error.stderr);
  });
  return stdout;
}

export async function getHistory(name: string, namespace: string, pathToKubeconfig: string): Promise<string> {
  const helm = await helmCli.binaryPath();
  const { stdout } = await promiseExec(`"${helm}" history ${name} --output json --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`).catch((error) => {
    throw(error.stderr);
  });
  return JSON.parse(stdout);
}

export async function rollback(name: string, namespace: string, revision: number, pathToKubeconfig: string): Promise<string> {
  const helm = await helmCli.binaryPath();
  const { stdout } = await promiseExec(`"${helm}" rollback ${name} ${revision} --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`).catch((error) => {
    throw(error.stderr);
  });
  return stdout;
}

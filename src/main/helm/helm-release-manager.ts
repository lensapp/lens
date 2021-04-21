import * as tempy from "tempy";
import fse from "fs-extra";
import * as yaml from "js-yaml";
import { promiseExec} from "../promise-exec";
import { helmCli } from "./helm-cli";
import { Cluster } from "../cluster";
import { toCamelCase } from "../../common/utils/camelCase";

export async function listReleases(pathToKubeconfig: string, namespace?: string) {
  const helm = await helmCli.binaryPath();
  const namespaceFlag = namespace ? `-n ${namespace}` : "--all-namespaces";

  try {
    const { stdout } = await promiseExec(`"${helm}" ls --output json ${namespaceFlag} --kubeconfig ${pathToKubeconfig}`);
    const output = JSON.parse(stdout);

    if (output.length == 0) {
      return output;
    }
    output.forEach((release: any, index: number) => {
      output[index] = toCamelCase(release);
    });

    return output;
  } catch ({ stderr }) {
    throw stderr;
  }
}


export async function installChart(chart: string, values: any, name: string | undefined, namespace: string, version: string, pathToKubeconfig: string){
  const helm = await helmCli.binaryPath();
  const fileName = tempy.file({name: "values.yaml"});

  await fse.writeFile(fileName, yaml.safeDump(values));

  try {
    let generateName = "";

    if (!name) {
      generateName = "--generate-name";
      name = "";
    }
    const { stdout } = await promiseExec(`"${helm}" install ${name} ${chart} --version ${version} -f ${fileName} --namespace ${namespace} --kubeconfig ${pathToKubeconfig} ${generateName}`);
    const releaseName = stdout.split("\n")[0].split(" ")[1].trim();

    return {
      log: stdout,
      release: {
        name: releaseName,
        namespace
      }
    };
  } catch ({ stderr }) {
    throw stderr;
  } finally {
    await fse.unlink(fileName);
  }
}

export async function upgradeRelease(name: string, chart: string, values: any, namespace: string, version: string, cluster: Cluster) {
  const helm = await helmCli.binaryPath();
  const fileName = tempy.file({name: "values.yaml"});

  await fse.writeFile(fileName, yaml.safeDump(values));

  try {
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();
    const { stdout } = await promiseExec(`"${helm}" upgrade ${name} ${chart} --version ${version} -f ${fileName} --namespace ${namespace} --kubeconfig ${proxyKubeconfig}`);

    return {
      log: stdout,
      release: getRelease(name, namespace, cluster)
    };
  } catch ({ stderr }) {
    throw stderr;
  } finally {
    await fse.unlink(fileName);
  }
}

export async function getRelease(name: string, namespace: string, cluster: Cluster) {
  try {
    const helm = await helmCli.binaryPath();
    const proxyKubeconfig = await cluster.getProxyKubeconfigPath();

    const { stdout } = await promiseExec(`"${helm}" status ${name} --output json --namespace ${namespace} --kubeconfig ${proxyKubeconfig}`);
    const release = JSON.parse(stdout);

    release.resources = await getResources(name, namespace, cluster);

    return release;
  } catch ({ stderr }) {
    throw stderr;
  }
}

export async function deleteRelease(name: string, namespace: string, pathToKubeconfig: string) {
  try {
    const helm = await helmCli.binaryPath();
    const { stdout  } = await promiseExec(`"${helm}" delete ${name} --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`);

    return stdout;
  } catch ({ stderr }) {
    throw stderr;
  }
}

export async function getValues(name: string, namespace: string, all: boolean, pathToKubeconfig: string) {
  try {
    const helm = await helmCli.binaryPath();
    const { stdout,  } = await promiseExec(`"${helm}" get values ${name} ${all ? "--all": ""} --output yaml --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`);

    return stdout;
  } catch ({ stderr }) {
    throw stderr;
  }
}

export async function getHistory(name: string, namespace: string, pathToKubeconfig: string) {
  try {
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" history ${name} --output json --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`);

    return JSON.parse(stdout);
  } catch ({ stderr }) {
    throw stderr;
  }
}

export async function rollback(name: string, namespace: string, revision: number, pathToKubeconfig: string) {
  try {
    const helm = await helmCli.binaryPath();
    const { stdout } = await promiseExec(`"${helm}" rollback ${name} ${revision} --namespace ${namespace} --kubeconfig ${pathToKubeconfig}`);

    return stdout;
  } catch ({ stderr }) {
    throw stderr;
  }
}

async function getResources(name: string, namespace: string, cluster: Cluster) {
  try {
    const helm = await helmCli.binaryPath();
    const kubectl = await cluster.kubeCtl.getPath();
    const pathToKubeconfig = await cluster.getProxyKubeconfigPath();
    const { stdout } = await promiseExec(`"${helm}" get manifest ${name} --namespace ${namespace} --kubeconfig ${pathToKubeconfig} | "${kubectl}" get -n ${namespace} --kubeconfig ${pathToKubeconfig} -f - -o=json`);

    return stdout;
  } catch {
    return { stdout: JSON.stringify({ items: [] }) };
  }
}

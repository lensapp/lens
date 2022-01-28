/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import tempy from "tempy";
import fse from "fs-extra";
import * as yaml from "js-yaml";
import { promiseExecFile } from "../../common/utils/promise-exec";
import { helmCli } from "./helm-cli";
import { toCamelCase } from "../../common/utils/camelCase";
import type { BaseEncodingOptions } from "fs";
import { execFile, ExecFileOptions } from "child_process";

async function execHelm(args: string[], options?: BaseEncodingOptions & ExecFileOptions): Promise<string> {
  const helmCliPath = await helmCli.binaryPath();

  try {
    const { stdout } = await promiseExecFile(helmCliPath, args, options);

    return stdout;
  } catch (error) {
    throw error?.stderr || error;
  }
}

export async function listReleases(pathToKubeconfig: string, namespace?: string): Promise<Record<string, any>[]> {
  const args = [
    "ls",
    "--all",
    "--output", "json",
  ];

  if (namespace) {
    args.push("-n", namespace);
  } else {
    args.push("--all-namespaces");
  }

  args.push("--kubeconfig", pathToKubeconfig);

  const output = JSON.parse(await execHelm(args));

  if (!Array.isArray(output) || output.length == 0) {
    return [];
  }

  return output.map(toCamelCase);
}


export async function installChart(chart: string, values: any, name: string | undefined = "", namespace: string, version: string, kubeconfigPath: string) {
  const valuesFilePath = tempy.file({ name: "values.yaml" });

  await fse.writeFile(valuesFilePath, yaml.dump(values));

  const args = ["install"];

  if (name) {
    args.push(name);
  }

  args.push(
    chart,
    "--version", version,
    "--values", valuesFilePath,
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
  );

  if (!name) {
    args.push("--generate-name");
  }

  try {
    const output = await execHelm(args);
    const releaseName = output.split("\n")[0].split(" ")[1].trim();

    return {
      log: output,
      release: {
        name: releaseName,
        namespace,
      },
    };
  } finally {
    await fse.unlink(valuesFilePath);
  }
}

export async function upgradeRelease(name: string, chart: string, values: any, namespace: string, version: string, kubeconfigPath: string, kubectlPath: string) {
  const valuesFilePath = tempy.file({ name: "values.yaml" });

  await fse.writeFile(valuesFilePath, yaml.dump(values));

  const args = [
    "upgrade",
    name,
    chart,
    "--version", version,
    "--values", valuesFilePath,
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
  ];

  try {
    const output = await execHelm(args);

    return {
      log: output,
      release: getRelease(name, namespace, kubeconfigPath, kubectlPath),
    };
  } finally {
    await fse.unlink(valuesFilePath);
  }
}

export async function getRelease(name: string, namespace: string, kubeconfigPath: string, kubectlPath: string) {
  const args = [
    "status",
    name,
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
    "--output", "json",
  ];

  const release = JSON.parse(await execHelm(args, {
    maxBuffer: 32 * 1024 * 1024 * 1024, // 32 MiB
  }));

  release.resources = await getResources(name, namespace, kubeconfigPath, kubectlPath);

  return release;
}

export function deleteRelease(name: string, namespace: string, kubeconfigPath: string) {
  return execHelm([
    "delete",
    name,
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
  ]);
}

interface GetValuesOptions {
  namespace: string;
  all?: boolean;
  kubeconfigPath: string;
}

export function getValues(name: string, { namespace, all = false, kubeconfigPath }: GetValuesOptions) {
  const args = [
    "get",
    "values",
    name,
  ];

  if (all) {
    args.push("--all");
  }

  args.push(
    "--output", "yaml",
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
  );

  return execHelm(args);
}

export async function getHistory(name: string, namespace: string, kubeconfigPath: string) {
  return JSON.parse(await execHelm([
    "history",
    name,
    "--output", "json",
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
  ]));
}

export async function rollback(name: string, namespace: string, revision: number, kubeconfigPath: string) {
  return JSON.parse(await execHelm([
    "rollback",
    name,
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
  ]));
}

async function getResources(name: string, namespace: string, kubeconfigPath: string, kubectlPath: string) {
  const helmArgs = [
    "get",
    "manifest",
    name,
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
  ];
  const kubectlArgs = [
    "get",
    "--namespace", namespace,
    "--kubeconfig", kubeconfigPath,
    "-f", "-",
    "--output", "json",
  ];

  try {
    const helmOutput = await execHelm(helmArgs);

    return new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";
      const kubectl = execFile(kubectlPath, kubectlArgs);

      kubectl
        .on("exit", (code, signal) => {
          if (typeof code === "number") {
            if (code === 0) {
              resolve(JSON.parse(stdout).items);
            } else {
              reject(stderr);
            }
          } else {
            reject(new Error(`Kubectl exited with signal ${signal}`));
          }
        })
        .on("error", reject);

      kubectl.stderr.on("data", output => stderr += output);
      kubectl.stdout.on("data", output => stdout += output);
      kubectl.stdin.write(helmOutput);
      kubectl.stdin.end();
    });
  } catch {
    return [];
  }
}

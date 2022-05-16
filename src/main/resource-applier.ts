/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../common/cluster/cluster";
import type { KubernetesObject } from "@kubernetes/client-node";
import { exec } from "child_process";
import fs from "fs-extra";
import * as yaml from "js-yaml";
import path from "path";
import tempy from "tempy";
import logger from "./logger";
import { appEventBus } from "../common/app-event-bus/event-bus";
import { isChildProcessError } from "../common/utils";
import type { Patch } from "rfc6902";
import { promiseExecFile } from "../common/utils/promise-exec";

export class ResourceApplier {
  constructor(protected cluster: Cluster) {}

  /**
   * Patch a kube resource's manifest, throwing any error that occurs.
   * @param name The name of the kube resource
   * @param kind The kind of the kube resource
   * @param patch The list of JSON operations
   * @param ns The optional namespace of the kube resource
   */
  async patch(name: string, kind: string, patch: Patch, ns?: string): Promise<string> {
    appEventBus.emit({ name: "resource", action: "patch" });

    const kubectl = await this.cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();
    const proxyKubeconfigPath = await this.cluster.getProxyKubeconfigPath();
    const args = [
      "--kubeconfig", proxyKubeconfigPath,
      "patch",
      kind,
      name,
    ];

    if (ns) {
      args.push("--namespace", ns);
    }

    args.push(
      "--type", "json",
      "--patch", JSON.stringify(patch),
      "-o", "json",
    );

    try {
      const { stdout } = await promiseExecFile(kubectlPath, args);

      return stdout;
    } catch (error) {
      if (isChildProcessError(error)) {
        throw error.stderr ?? error;
      }

      throw error;
    }
  }

  async apply(resource: KubernetesObject | any): Promise<string> {
    resource = this.sanitizeObject(resource);
    appEventBus.emit({ name: "resource", action: "apply" });

    return this.kubectlApply(yaml.dump(resource));
  }

  protected async kubectlApply(content: string): Promise<string> {
    const kubectl = await this.cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();
    const proxyKubeconfigPath = await this.cluster.getProxyKubeconfigPath();
    const fileName = tempy.file({ name: "resource.yaml" });
    const args = [
      "apply",
      "--kubeconfig", proxyKubeconfigPath,
      "-o", "json",
      "-f", fileName,
    ];

    logger.debug(`shooting manifests with ${kubectlPath}`, { args });

    const execEnv = { ...process.env };
    const httpsProxy = this.cluster.preferences?.httpsProxy;

    if (httpsProxy) {
      execEnv.HTTPS_PROXY = httpsProxy;
    }

    try {
      await fs.writeFile(fileName, content);
      const { stdout } = await promiseExecFile(kubectlPath, args);

      return stdout;
    } catch (error) {
      if (isChildProcessError(error)) {
        throw error.stderr ?? error;
      }

      throw error;
    } finally {
      await fs.unlink(fileName);
    }
  }

  public async kubectlApplyAll(resources: string[], extraArgs = ["-o", "json"]): Promise<string> {
    return this.kubectlCmdAll("apply", resources, extraArgs);
  }

  public async kubectlDeleteAll(resources: string[], extraArgs?: string[]): Promise<string> {
    return this.kubectlCmdAll("delete", resources, extraArgs);
  }

  protected async kubectlCmdAll(subCmd: string, resources: string[], args: string[] = []): Promise<string> {
    const kubectl = await this.cluster.ensureKubectl();
    const kubectlPath = await kubectl.getPath();
    const proxyKubeconfigPath = await this.cluster.getProxyKubeconfigPath();

    return new Promise((resolve, reject) => {
      const tmpDir = tempy.directory();

      // Dump each resource into tmpDir
      resources.forEach((resource, index) => {
        fs.writeFileSync(path.join(tmpDir, `${index}.yaml`), resource);
      });
      args.push("-f", `"${tmpDir}"`);
      const cmd = `"${kubectlPath}" ${subCmd} --kubeconfig "${proxyKubeconfigPath}" ${args.join(" ")}`;

      logger.info(`[RESOURCE-APPLIER] running cmd ${cmd}`);
      exec(cmd, (error, stdout) => {
        if (error) {
          logger.error(`[RESOURCE-APPLIER] cmd errored: ${error}`);
          const splitError = error.toString().split(`.yaml": `);

          if (splitError[1]) {
            reject(splitError[1]);
          } else {
            reject(error);
          }

          return;
        }

        resolve(stdout);
      });
    });
  }

  protected sanitizeObject(resource: KubernetesObject | any) {
    const res = JSON.parse(JSON.stringify(resource));

    delete res.status;
    delete res.metadata?.resourceVersion;
    const annotations = res.metadata?.annotations;

    if (annotations) {
      delete annotations["kubectl.kubernetes.io/last-applied-configuration"];
    }

    return res;
  }
}

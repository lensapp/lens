/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";
import * as yaml from "js-yaml";
import tempy from "tempy";
import type { Patch } from "rfc6902";
import type { KubernetesObject } from "@kubernetes/client-node";
import type { EmitAppEvent } from "../../common/app-event-bus/emit-event.injectable";
import type { Logger } from "@k8slens/logger";
import type { WriteFile } from "../../common/fs/write-file.injectable";
import type { RemovePath } from "../../common/fs/remove.injectable";
import type { ExecFile } from "../../common/fs/exec-file.injectable";
import type { JoinPaths } from "../../common/path/join-paths.injectable";
import type { CreateKubectl } from "../kubectl/create-kubectl.injectable";
import type { KubeconfigManager } from "../kubeconfig-manager/kubeconfig-manager";
import type { AsyncResult } from "@k8slens/utilities";

export interface ResourceApplierDependencies {
  emitAppEvent: EmitAppEvent;
  writeFile: WriteFile;
  deleteFile: RemovePath;
  execFile: ExecFile;
  joinPaths: JoinPaths;
  createKubectl: CreateKubectl;
  readonly proxyKubeconfigManager: KubeconfigManager;
  readonly logger: Logger;
}

export class ResourceApplier {
  constructor(
    protected readonly dependencies: ResourceApplierDependencies,
    protected readonly cluster: Cluster,
  ) {}

  private async getKubectlPath() {
    const kubectl = this.dependencies.createKubectl(this.cluster.version.get());

    await kubectl.ensureKubectl();

    return kubectl.getPath();
  }

  /**
   * Patch a kube resource's manifest, throwing any error that occurs.
   * @param name The name of the kube resource
   * @param kind The kind of the kube resource
   * @param patch The list of JSON operations
   * @param ns The optional namespace of the kube resource
   */
  async patch(name: string, kind: string, patch: Patch, ns?: string): Promise<string> {
    this.dependencies.emitAppEvent({ name: "resource", action: "patch" });

    const kubectlPath = await this.getKubectlPath();
    const proxyKubeconfigPath = await this.dependencies.proxyKubeconfigManager.ensurePath();
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

    const result = await this.dependencies.execFile(kubectlPath, args);

    if (result.callWasSuccessful) {
      return result.response;
    }

    throw result.error.stderr || result.error.message;
  }

  async create(resource: string): AsyncResult<string, string> {
    this.dependencies.emitAppEvent({ name: "resource", action: "apply" });

    return this.kubectlApply(this.sanitizeObject(resource));
  }

  protected async kubectlApply(content: string): AsyncResult<string, string> {
    const kubectlPath = await this.getKubectlPath();
    const proxyKubeconfigPath = await this.dependencies.proxyKubeconfigManager.ensurePath();
    const fileName = tempy.file({ name: "resource.yaml" });
    const args = [
      "apply",
      "--kubeconfig", proxyKubeconfigPath,
      "-o", "json",
      "-f", fileName,
    ];

    this.dependencies.logger.debug(`shooting manifests with ${kubectlPath}`, { args });

    const execEnv = { ...process.env };
    const httpsProxy = this.cluster.preferences?.httpsProxy;

    if (httpsProxy) {
      execEnv.HTTPS_PROXY = httpsProxy;
    }

    try {
      await this.dependencies.writeFile(fileName, content);

      const result = await this.dependencies.execFile(kubectlPath, args);

      if (result.callWasSuccessful) {
        return result;
      }

      return {
        callWasSuccessful: false,
        error: result.error.stderr || result.error.message,
      };
    } finally {
      await this.dependencies.deleteFile(fileName);
    }
  }

  public async kubectlApplyAll(resources: string[], extraArgs = ["-o", "json"]): AsyncResult<string, string> {
    return this.kubectlCmdAll("apply", resources, extraArgs);
  }

  public async kubectlDeleteAll(resources: string[], extraArgs?: string[]): AsyncResult<string, string> {
    return this.kubectlCmdAll("delete", resources, extraArgs);
  }

  protected async kubectlCmdAll(subCmd: string, resources: string[], parentArgs: string[] = []): AsyncResult<string, string> {
    const kubectlPath = await this.getKubectlPath();
    const proxyKubeconfigPath = await this.dependencies.proxyKubeconfigManager.ensurePath();
    const tmpDir = tempy.directory();

    await Promise.all(resources.map((resource, index) => this.dependencies.writeFile(
      this.dependencies.joinPaths(tmpDir, `${index}.yaml`),
      resource,
    )));

    const args = [
      subCmd,
      "--kubeconfig", proxyKubeconfigPath,
      ...parentArgs,
      "-f", tmpDir,
    ];

    this.dependencies.logger.info(`[RESOURCE-APPLIER] running kubectl`, { args });
    const result = await this.dependencies.execFile(kubectlPath, args);

    if (result.callWasSuccessful) {
      return result;
    }

    this.dependencies.logger.error(`[RESOURCE-APPLIER] kubectl errored: ${result.error.message}`);

    const splitError = result.error.stderr.split(`.yaml": `);

    return {
      callWasSuccessful: false,
      error: splitError[1] || result.error.message,
    };
  }

  protected sanitizeObject(resource: string) {
    const res = yaml.load(resource) as Partial<KubernetesObject> & { status?: object };

    delete res.status;
    delete res.metadata?.resourceVersion;
    delete res.metadata?.annotations?.["kubectl.kubernetes.io/last-applied-configuration"];

    return yaml.dump(res);
  }
}

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { v4 as uuid } from "uuid";
import { Watch, CoreV1Api } from "@kubernetes/client-node";
import type { KubeConfig } from "@kubernetes/client-node";
import type { ShellSessionArgs, ShellSessionDependencies } from "../shell-session";
import { ShellOpenError, ShellSession } from "../shell-session";
import { get, once } from "lodash";
import { NodeApi } from "../../../common/k8s-api/endpoints";
import { TerminalChannels } from "../../../common/terminal/channels";
import type { CreateKubeJsonApiForCluster } from "../../../common/k8s-api/create-kube-json-api-for-cluster.injectable";
import type { CreateKubeApi } from "../../../common/k8s-api/create-kube-api.injectable";
import { initialNodeShellImage } from "../../../common/cluster-types";
import type { LoadProxyKubeconfig } from "../../cluster/load-proxy-kubeconfig.injectable";
import type { Pod } from "@k8slens/kube-object";

export interface NodeShellSessionArgs extends ShellSessionArgs {
  nodeName: string;
}

export interface NodeShellSessionDependencies extends ShellSessionDependencies {
  createKubeJsonApiForCluster: CreateKubeJsonApiForCluster;
  createKubeApi: CreateKubeApi;
  loadProxyKubeconfig: LoadProxyKubeconfig;
}

export class NodeShellSession extends ShellSession {
  ShellType = "node-shell";

  protected readonly podName = `node-shell-${uuid()}`;
  protected readonly nodeName: string;
  protected readonly cwd: string | undefined = undefined;

  constructor(protected readonly dependencies: NodeShellSessionDependencies, { nodeName, ...args }: NodeShellSessionArgs) {
    super(dependencies, args);
    this.nodeName = nodeName;
  }

  public async open() {
    const proxyKubeconfig = await this.dependencies.loadProxyKubeconfig();
    const coreApi = proxyKubeconfig.makeApiClient(CoreV1Api);

    const cleanup = once(() => {
      coreApi
        .deleteNamespacedPod(this.podName, "kube-system")
        .catch(error => this.dependencies.logger.warn(`[NODE-SHELL]: failed to remove pod shell`, error));
    });

    this.websocket.once("close", cleanup);

    try {
      await this.createNodeShellPod(coreApi);
      await this.waitForRunningPod(proxyKubeconfig);
    } catch (error) {
      cleanup();

      this.send({
        type: TerminalChannels.STDOUT,
        data: `Error occurred: ${get(error, "response.body.message", error ? String(error) : "unknown error")}`,
      });

      throw new ShellOpenError(
        "failed to create node pod",
        error instanceof Error
          ? { cause: error }
          : undefined,
      );
    }

    const env = await this.getCachedShellEnv();
    const args = ["exec", "-i", "-t", "-n", "kube-system", this.podName, "--"];
    const nodeApi = this.dependencies.createKubeApi(NodeApi, {
      request: this.dependencies.createKubeJsonApiForCluster(this.cluster.id),
    });
    const node = await nodeApi.get({ name: this.nodeName });

    if (!node) {
      throw new Error(`No node with name=${this.nodeName} found`);
    }

    const nodeOs = node.getOperatingSystem();

    switch (nodeOs) {
      default:
        this.dependencies.logger.warn(`[NODE-SHELL-SESSION]: could not determine node OS, falling back with assumption of linux`);
        // fallthrough
      case "linux":
        args.push("sh", "-c", "((clear && bash) || (clear && ash) || (clear && sh))");
        break;
      case "windows":
        args.push("powershell");
        break;
    }

    await this.openShellProcess(this.dependencies.directoryContainingKubectl, args, env);
  }

  protected createNodeShellPod(coreApi: CoreV1Api) {
    const {
      imagePullSecret,
      nodeShellImage,
    } = this.cluster.preferences;

    const imagePullSecrets = imagePullSecret
      ? [{
        name: imagePullSecret,
      }]
      : undefined;

    return coreApi
      .createNamespacedPod("kube-system", {
        metadata: {
          name: this.podName,
          namespace: "kube-system",
        },
        spec: {
          nodeName: this.nodeName,
          restartPolicy: "Never",
          terminationGracePeriodSeconds: 0,
          hostPID: true,
          hostIPC: true,
          hostNetwork: true,
          tolerations: [{
            operator: "Exists",
          }],
          priorityClassName: "system-node-critical",
          containers: [{
            name: "shell",
            image: nodeShellImage || initialNodeShellImage,
            securityContext: {
              privileged: true,
            },
            command: ["nsenter"],
            args: ["-t", "1", "-m", "-u", "-i", "-n", "sleep", "14000"],
          }],
          imagePullSecrets,
        },
      });
  }

  protected waitForRunningPod(kc: KubeConfig): Promise<void> {
    this.dependencies.logger.debug(`[NODE-SHELL]: waiting for ${this.podName} to be running`);

    return new Promise((resolve, reject) => {
      new Watch(kc)
        .watch(`/api/v1/namespaces/kube-system/pods`,
          {},
          // callback is called for each received object.
          (type, { metadata: { name }, status }: Pod) => {
            if (name === this.podName) {
              switch (status?.phase) {
                case "Running":
                  return resolve();
                case "Failed":
                  return reject(`Failed to be created: ${(status as unknown as Record<string, string>).message || "unknown error"}`);
              }
            }
          },
          // done callback is called if the watch terminates normally
          (err) => {
            this.dependencies.logger.error(`[NODE-SHELL]: ${this.podName} was not created in time`);
            reject(err);
          },
        )
        .then(req => {
          setTimeout(() => {
            this.dependencies.logger.error(`[NODE-SHELL]: aborting wait for ${this.podName}, timing out`);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            req.abort();
            reject("Pod creation timed out");
          }, 2 * 60 * 1000); // 2 * 60 * 1000
        })
        .catch(error => {
          this.dependencies.logger.error(`[NODE-SHELL]: waiting for ${this.podName} failed: ${String(error)}`);
          reject(error);
        });
    });
  }
}

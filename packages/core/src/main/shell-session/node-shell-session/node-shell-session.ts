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
import { NodeApi } from "@k8slens/kube-api";
import { TerminalChannels } from "../../../common/terminal/channels";
import type { CreateKubeJsonApiForCluster } from "../../../common/k8s-api/create-kube-json-api-for-cluster.injectable";
import type { CreateKubeApi } from "../../../common/k8s-api/create-kube-api.injectable";
import { initialNodeShellImage, initialNodeShellWindowsImage } from "../../../common/cluster-types";
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
    const args = ["attach", "-q", "-i", "-t", "-n", "kube-system", this.podName];

    await this.openShellProcess(await this.kubectl.getPath(), args, env);
  }

  protected async createNodeShellPod(coreApi: CoreV1Api) {
    const {
      imagePullSecret,
      nodeShellImage,
    } = this.cluster.preferences;

    const imagePullSecrets = imagePullSecret
      ? [{
        name: imagePullSecret,
      }]
      : undefined;

    const nodeApi = this.dependencies.createKubeApi(NodeApi, {
      request: this.dependencies.createKubeJsonApiForCluster(this.cluster.id),
    });
    const node = await nodeApi.get({ name: this.nodeName });

    if (!node) {
      throw new Error(`No node with name=${this.nodeName} found`);
    }

    const nodeOs = node.getOperatingSystem();
    const nodeOsImage = node.getOperatingSystemImage();
    const nodeKernelVersion = node.getKernelVersion();

    let image: string;
    let command: string[]; 
    let args: string[];
    let securityContext: any;

    switch (nodeOs) {
      default:
        this.dependencies.logger.warn(`[NODE-SHELL-SESSION]: could not determine node OS, falling back with assumption of linux`);
        // fallthrough
      case "linux":
        image = nodeShellImage || initialNodeShellImage;
        command = ["nsenter"];

        if (nodeOsImage && nodeOsImage.startsWith("Bottlerocket OS")) {
          args = ["-t", "1", "-m", "-u", "-i", "-n", "-p", "--", "apiclient", "exec", "admin", "bash", "-l"];
        } else {
          args = ["-t", "1", "-m", "-u", "-i", "-n", "-p", "--", "bash", "-l"];
        }

        securityContext = {
          privileged: true,
        };
        break;
      case "windows":
        if (nodeKernelVersion) {
          image = nodeShellImage || initialNodeShellWindowsImage;
        } else {
          throw new Error(`No status with kernel version for node ${this.nodeName} found`);
        }
        command = ["cmd.exe"];
        args = ["/c", "%CONTAINER_SANDBOX_MOUNT_POINT%\\Program Files\\PowerShell\\latest\\pwsh.exe", "-nol", "-wd", "C:\\"];
        securityContext = {
          privileged: true,
          windowsOptions: {
            hostProcess: true,
            runAsUserName: "NT AUTHORITY\\SYSTEM",
          },
        };
        break;
    }

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
            image,
            securityContext,
            command,
            args,
            stdin: true,
            stdinOnce: true,
            tty: true,
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

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type WebSocket from "ws";
import { v4 as uuid } from "uuid";
import { Watch, CoreV1Api } from "@kubernetes/client-node";
import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../../../common/cluster/cluster";
import { ShellOpenError, ShellSession } from "../shell-session";
import { get, once } from "lodash";
import { Node, NodeApi } from "../../../common/k8s-api/endpoints";
import { KubeJsonApi } from "../../../common/k8s-api/kube-json-api";
import logger from "../../logger";
import { TerminalChannels } from "../../../renderer/api/terminal-api";
import type { Kubectl } from "../../kubectl/kubectl";

export class NodeShellSession extends ShellSession {
  ShellType = "node-shell";

  protected readonly podName = `node-shell-${uuid()}`;

  protected readonly cwd: string | undefined = undefined;

  constructor(protected nodeName: string, kubectl: Kubectl, socket: WebSocket, cluster: Cluster, terminalId: string) {
    super(kubectl, socket, cluster, terminalId);
  }

  public async open() {
    const kc = await this.cluster.getProxyKubeconfig();
    const coreApi = kc.makeApiClient(CoreV1Api);
    const shell = await this.kubectl.getPath();

    const cleanup = once(() => {
      coreApi
        .deleteNamespacedPod(this.podName, "kube-system")
        .catch(error => logger.warn(`[NODE-SHELL]: failed to remove pod shell`, error));
    });

    this.websocket.once("close", cleanup);

    try {
      await this.createNodeShellPod(coreApi);
      await this.waitForRunningPod(kc);
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
    const nodeApi = new NodeApi({
      objectConstructor: Node,
      request: KubeJsonApi.forCluster(this.cluster.id),
    });
    const node = await nodeApi.get({ name: this.nodeName });

    if (!node) {
      throw new Error(`No node with name=${this.nodeName} found`);
    }

    const nodeOs = node.getOperatingSystem();

    switch (nodeOs) {
      default:
        logger.warn(`[NODE-SHELL-SESSION]: could not determine node OS, falling back with assumption of linux`);
        // fallthrough
      case "linux":
        args.push("sh", "-c", "((clear && bash) || (clear && ash) || (clear && sh))");
        break;
      case "windows":
        args.push("powershell");
        break;
    }

    await this.openShellProcess(shell, args, env);
  }

  protected createNodeShellPod(coreApi: CoreV1Api) {
    const imagePullSecrets = this.cluster.imagePullSecret
      ? [{
        name: this.cluster.imagePullSecret,
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
            image: this.cluster.nodeShellImage,
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
    logger.debug(`[NODE-SHELL]: waiting for ${this.podName} to be running`);

    return new Promise((resolve, reject) => {
      new Watch(kc)
        .watch(`/api/v1/namespaces/kube-system/pods`,
          {},
          // callback is called for each received object.
          (type, { metadata: { name }, status }) => {
            if (name === this.podName) {
              switch (status.phase) {
                case "Running":
                  return resolve();
                case "Failed":
                  return reject(`Failed to be created: ${status.message || "unknown error"}`);
              }
            }
          },
          // done callback is called if the watch terminates normally
          (err) => {
            logger.error(`[NODE-SHELL]: ${this.podName} was not created in time`);
            reject(err);
          },
        )
        .then(req => {
          setTimeout(() => {
            logger.error(`[NODE-SHELL]: aborting wait for ${this.podName}, timing out`);
            req.abort();
            reject("Pod creation timed out");
          }, 2 * 60 * 1000); // 2 * 60 * 1000
        })
        .catch(error => {
          logger.error(`[NODE-SHELL]: waiting for ${this.podName} failed: ${error}`);
          reject(error);
        });
    });
  }
}

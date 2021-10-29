/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type * as WebSocket from "ws";
import { v4 as uuid } from "uuid";
import * as k8s from "@kubernetes/client-node";
import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../cluster";
import { ShellOpenError, ShellSession } from "./shell-session";
import { get } from "lodash";

export class NodeShellSession extends ShellSession {
  ShellType = "node-shell";

  protected podId = `node-shell-${uuid()}`;
  protected kc: KubeConfig;

  protected get cwd(): string | undefined {
    return undefined;
  }

  constructor(socket: WebSocket, cluster: Cluster, protected nodeName: string) {
    super(socket, cluster);
  }

  public async open() {
    this.kc = await this.cluster.getProxyKubeconfig();
    const shell = await this.kubectl.getPath();

    try {
      await this.createNodeShellPod();
      await this.waitForRunningPod();
    } catch (error) {
      this.deleteNodeShellPod();
      this.sendResponse(`Error occurred: ${get(error, "response.body.message", error?.toString() || "unknown error")}`);

      throw new ShellOpenError("failed to create node pod", error);
    }

    const args = ["exec", "-i", "-t", "-n", "kube-system", this.podId, "--", "sh", "-c", "((clear && bash) || (clear && ash) || (clear && sh))"];
    const env = await this.getCachedShellEnv();

    await super.open(shell, args, env);
  }

  protected createNodeShellPod() {
    const imagePullSecrets = this.cluster.imagePullSecret
      ? [{
        name: this.cluster.imagePullSecret,
      }]
      : undefined;

    return this
      .kc
      .makeApiClient(k8s.CoreV1Api)
      .createNamespacedPod("kube-system", {
        metadata: {
          name: this.podId,
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

  protected waitForRunningPod(): Promise<void> {
    return new Promise((resolve, reject) => {
      const watch = new k8s.Watch(this.kc);

      watch
        .watch(`/api/v1/namespaces/kube-system/pods`,
          {},
          // callback is called for each received object.
          (type, obj) => {
            if (obj.metadata.name == this.podId && obj.status.phase === "Running") {
              resolve();
            }
          },
          // done callback is called if the watch terminates normally
          (err) => {
            console.log(err);
            reject(err);
          },
        )
        .then(req => {
          setTimeout(() => {
            console.log("aborting");
            req.abort();
          }, 2 * 60 * 1000);
        })
        .catch(err => {
          console.log("watch failed");
          reject(err);
        });
    });
  }

  protected exit() {
    super.exit();
    this.deleteNodeShellPod();
  }

  protected deleteNodeShellPod() {
    this
      .kc
      .makeApiClient(k8s.CoreV1Api)
      .deleteNamespacedPod(this.podId, "kube-system");
  }
}

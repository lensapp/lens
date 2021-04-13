import * as WebSocket from "ws";
import { v4 as uuid } from "uuid";
import * as k8s from "@kubernetes/client-node";
import { KubeConfig } from "@kubernetes/client-node";
import { Cluster } from "../cluster";
import { ShellOpenError, ShellSession } from "./shell-session";

export class NodeShellSession extends ShellSession {
  ShellType = "node-shell";

  protected podId = `node-shell-${uuid()}`;
  protected kc: KubeConfig;

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
      this.sendResponse("Error occurred. ");

      throw new ShellOpenError("failed to create node pod", error);
    }

    const args = ["exec", "-i", "-t", "-n", "kube-system", this.podId, "--", "sh", "-c", "((clear && bash) || (clear && ash) || (clear && sh))"];
    const env = await this.getCachedShellEnv();

    super.open(shell, args, env);
  }

  protected createNodeShellPod() {
    return this
      .kc
      .makeApiClient(k8s.CoreV1Api)
      .createNamespacedPod("kube-system", {
        metadata: {
          name: this.podId,
          namespace: "kube-system"
        },
        spec: {
          nodeName: this.nodeName,
          restartPolicy: "Never",
          terminationGracePeriodSeconds: 0,
          hostPID: true,
          hostIPC: true,
          hostNetwork: true,
          tolerations: [{
            operator: "Exists"
          }],
          containers: [{
            name: "shell",
            image: "docker.io/alpine:3.12",
            securityContext: {
              privileged: true,
            },
            command: ["nsenter"],
            args: ["-t", "1", "-m", "-u", "-i", "-n", "sleep", "14000"]
          }],
        }
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
          }
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

  protected deleteNodeShellPod() {
    this
      .kc
      .makeApiClient(k8s.CoreV1Api)
      .deleteNamespacedPod(this.podId, "kube-system");
  }
}

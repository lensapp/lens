import * as WebSocket from "ws";
import { ShellSession } from "./shell-session";
import { v4 as uuid } from "uuid";
import * as k8s from "@kubernetes/client-node";
import { KubeConfig } from "@kubernetes/client-node";
import { Cluster } from "./cluster";
import logger from "./logger";
import { LocalShellSession } from "./local-shell-session";

export class NodeShellSession extends ShellSession {
  protected readonly EventName = "node-shell";
  protected podId = `node-shell-${uuid()}`;
  protected kc: KubeConfig;

  constructor(socket: WebSocket, cluster: Cluster, protected nodeName: string) {
    super(socket, cluster);
    this.kc = cluster.getProxyKubeconfig();
  }

  public async open() {
    if (this.createNodeShellPod(this.podId, this.nodeName)) {
      await this.waitForRunningPod(this.podId).catch(() => {
        this.exit(1001);
      });
    }

    return this.rawOpen();
  }

  protected async getShell(): Promise<string> {
    return this.kubectl.getPath();
  }

  protected async getShellArgs(): Promise<string[]> {
    return ["exec", "-i", "-t", "-n", "kube-system", this.podId, "--", "sh", "-c", "((clear && bash) || (clear && ash) || (clear && sh))"];
  }

  protected exit(code = 1000) {
    if (this.podId) {
      this.deleteNodeShellPod();
    }
    super.exit(code);
  }

  protected async createNodeShellPod(podId: string, nodeName: string) {
    const kc = this.getKubeConfig();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    const pod = {
      metadata: {
        name: podId,
        namespace: "kube-system"
      },
      spec: {
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
        nodeSelector: {
          "kubernetes.io/hostname": nodeName
        }
      }
    } as k8s.V1Pod;

    await k8sApi.createNamespacedPod("kube-system", pod).catch((error) => {
      logger.error(error);

      return false;
    });

    return true;
  }

  protected getKubeConfig() {
    if (this.kc) {
      return this.kc;
    }
    this.kc = new k8s.KubeConfig();
    this.kc.loadFromFile(this.kubeconfigPath);

    return this.kc;
  }

  protected waitForRunningPod(podId: string) {
    return new Promise<boolean>(async (resolve, reject) => {
      const kc = this.getKubeConfig();
      const watch = new k8s.Watch(kc);
      const req = await watch.watch(`/api/v1/namespaces/kube-system/pods`, {},
        // callback is called for each received object.
        (type, obj) => {
          if (obj.metadata.name == podId && obj.status.phase === "Running") {
            resolve(true);
          }
        },
        // done callback is called if the watch terminates normally
        (err) => {
          logger.error(err);
          reject(false);
        }
      );

      setTimeout(() => {
        req.abort();
        reject(false);
      }, 120 * 1000);
    });
  }

  protected deleteNodeShellPod() {
    const kc = this.getKubeConfig();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

    k8sApi.deleteNamespacedPod(this.podId, "kube-system");
  }
}

export async function openShell(socket: WebSocket, cluster: Cluster, nodeName?: string): Promise<ShellSession> {
  let shell: ShellSession;

  if (nodeName) {
    shell = new NodeShellSession(socket, cluster, nodeName);
  } else {
    shell = new LocalShellSession(socket, cluster);
  }
  shell.open();

  return shell;
}

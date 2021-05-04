import { LensApiRequest } from "../router";
import { LensApi } from "../lens-api";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Kubectl } from "../kubectl";
import { shell } from "electron";
import * as tcpPortUsed from "tcp-port-used";
import logger from "../logger";
import { getPortFrom } from "../utils/get-port";

interface PortForwardArgs {
  clusterId: string;
  kind: string;
  namespace: string;
  name: string;
  port: string;
}

const internalPortRegex = /^forwarding from (?<address>.+) ->/i;

class PortForward {
  public static portForwards: PortForward[] = [];

  static getPortforward(forward: PortForwardArgs) {
    return PortForward.portForwards.find((pf) => (
      pf.clusterId == forward.clusterId &&
      pf.kind == forward.kind &&
      pf.name == forward.name &&
      pf.namespace == forward.namespace &&
      pf.port == forward.port
    ));
  }

  public process: ChildProcessWithoutNullStreams;
  public clusterId: string;
  public kind: string;
  public namespace: string;
  public name: string;
  public port: string;
  public internalPort?: number;

  constructor(public kubeConfig: string, args: PortForwardArgs) {
    this.clusterId = args.clusterId;
    this.kind = args.kind;
    this.namespace = args.namespace;
    this.name = args.name;
    this.port = args.port;
  }

  public async start() {
    const kubectlBin = await Kubectl.bundled().getPath();
    const args = [
      "--kubeconfig", this.kubeConfig,
      "port-forward",
      "-n", this.namespace,
      `${this.kind}/${this.name}`,
      `:${this.port}`
    ];

    this.process = spawn(kubectlBin, args, {
      env: process.env
    });
    PortForward.portForwards.push(this);
    this.process.on("exit", () => {
      const index = PortForward.portForwards.indexOf(this);

      if (index > -1) {
        PortForward.portForwards.splice(index, 1);
      }
    });

    this.internalPort = await getPortFrom(this.process.stdout, {
      lineRegex: internalPortRegex,
    });

    try {
      await tcpPortUsed.waitUntilUsed(this.internalPort, 500, 15000);

      return true;
    } catch (error) {
      this.process.kill();

      return false;
    }
  }

  public open() {
    shell.openExternal(`http://localhost:${this.internalPort}`)
      .catch(error => logger.error(`[PORT-FORWARD]: failed to open external shell: ${error}`, {
        clusterId: this.clusterId,
        port: this.port,
        kind: this.kind,
        namespace: this.namespace,
        name: this.name,
      }));
  }
}

class PortForwardRoute extends LensApi {

  public async routePortForward(request: LensApiRequest) {
    const { params, response, cluster} = request;
    const { namespace, port, resourceType, resourceName } = params;
    let portForward = PortForward.getPortforward({
      clusterId: cluster.id, kind: resourceType, name: resourceName,
      namespace, port
    });

    if (!portForward) {
      logger.info(`Creating a new port-forward ${namespace}/${resourceType}/${resourceName}:${port}`);
      portForward = new PortForward(await cluster.getProxyKubeconfigPath(), {
        clusterId: cluster.id,
        kind: resourceType,
        namespace,
        name: resourceName,
        port,
      });
      const started = await portForward.start();

      if (!started) {
        this.respondJson(response, {
          message: "Failed to open port-forward"
        }, 400);

        return;
      }
    }

    portForward.open();

    this.respondJson(response, {});
  }
}

export const portForwardRoute = new PortForwardRoute();

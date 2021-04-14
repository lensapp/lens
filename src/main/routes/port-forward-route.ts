import { LensApiRequest } from "../router";
import { LensApi } from "../lens-api";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Kubectl } from "../kubectl";
import { getFreePort } from "../port";
import { shell } from "electron";
import * as tcpPortUsed from "tcp-port-used";
import logger from "../logger";
import { AssertionError } from "assert";
import { assert } from "../../common/utils";

interface PortForwardOpts {
  clusterId: string;
  process?: ChildProcessWithoutNullStreams;
  kubeConfig: string;
  kind: string;
  namespace: string;
  name: string;
  port: string;
  localPort?: number;
}

interface GetPortForwardOptions {
  clusterId: string;
  kind: string;
  name: string;
  namespace: string;
  port: string;
}

class PortForward {
  public static portForwards: PortForward[] = [];

  static getPortforward(forward: GetPortForwardOptions) {
    return PortForward.portForwards.find(pf => (
      pf.clusterId == forward.clusterId &&
      pf.kind == forward.kind &&
      pf.name == forward.name &&
      pf.namespace == forward.namespace &&
      pf.port == forward.port
    ));
  }

  public clusterId: string;
  public process?: ChildProcessWithoutNullStreams;
  public kubeConfig: string;
  public kind: string;
  public namespace: string;
  public name: string;
  public port: string;
  public localPort?: number;

  constructor(obj: PortForwardOpts) {
    this.clusterId = obj.clusterId;
    this.process = obj.process;
    this.kubeConfig = obj.kubeConfig;
    this.kind = obj.kind;
    this.namespace = obj.namespace;
    this.name = obj.name;
    this.port = obj.port;
    this.localPort = obj.localPort;
  }

  public async start() {
    this.localPort = await getFreePort();
    const kubectlBin = await Kubectl.bundled().getPath();
    const args = [
      "--kubeconfig", this.kubeConfig,
      "port-forward",
      "-n", this.namespace,
      `${this.kind}/${this.name}`,
      `${this.localPort}:${this.port}`
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

    try {
      await tcpPortUsed.waitUntilUsed(this.localPort, 500, 15000);

      return true;
    } catch (error) {
      this.process.kill();

      return false;
    }
  }

  public open() {
    shell.openExternal(`http://localhost:${this.localPort}`);
  }
}

class PortForwardRoute extends LensApi {
  public async routePortForward(request: LensApiRequest) {
    const { params, response, cluster: maybeCluster } = request;

    try {
      const cluster = assert(maybeCluster, "No Cluster defined on request");
      const namespace = assert(params.namespace, "Namespace not provided");
      const port = assert(params.port, "Port not provided");
      const name = assert(params.resourceName, "ResourceName not provided");
      const kind = assert(params.resourceType, "ResourceName not provided");

      let portForward = PortForward.getPortforward({ clusterId: cluster.id, kind, name, namespace, port });

      if (!portForward) {
        const kubeConfig = assert(await cluster.getProxyKubeconfigPath(), "Cluster must be initialized before being port forwarded from");

        logger.info(`Creating a new port-forward ${namespace}/${kind}/${name}:${port}`);
        portForward = new PortForward({
          clusterId: cluster.id,
          kind,
          namespace,
          name,
          port,
          kubeConfig,
        });
        const started = await portForward.start();

        if (!started) {
          return void this.respondJson(response, {
            message: "Failed to open port-forward"
          }, 400);
        }
      }

      portForward.open();

      this.respondJson(response, {});
    } catch (error) {
      logger.error(`[PORT-FORWARD-ROUTE]: routeServiceAccount failed: ${error}`);

      if (error instanceof AssertionError) {
        this.respondText(response, error.message, 404);
      } else {
        this.respondText(response, error.toString(), 404);
      }
    }
  }
}

export const portForwardRoute = new PortForwardRoute();

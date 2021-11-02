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

import type { LensApiRequest } from "../router";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { Kubectl } from "../kubectl";
import * as tcpPortUsed from "tcp-port-used";
import logger from "../logger";
import { getPortFrom } from "../utils/get-port";
import { respondJson } from "../utils/http-responses";

interface PortForwardArgs {
  clusterId: string;
  kind: string;
  namespace: string;
  name: string;
  port: number;
  forwardPort: number;
  protocol?: string;
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
      pf.port == forward.port &&
      (!forward.protocol || pf.protocol == forward.protocol)
    ));
  }

  public process: ChildProcessWithoutNullStreams;
  public clusterId: string;
  public kind: string;
  public namespace: string;
  public name: string;
  public port: number;
  public forwardPort: number;
  public protocol: string;

  constructor(public kubeConfig: string, args: PortForwardArgs) {
    this.clusterId = args.clusterId;
    this.kind = args.kind;
    this.namespace = args.namespace;
    this.name = args.name;
    this.port = args.port;
    this.forwardPort = args.forwardPort;
    this.protocol = args.protocol ?? "http";
  }

  public async start() {
    const kubectlBin = await Kubectl.bundled().getPath(true);
    const args = [
      "--kubeconfig", this.kubeConfig,
      "port-forward",
      "-n", this.namespace,
      `${this.kind}/${this.name}`,
      `${this.forwardPort ?? ""}:${this.port}`,
    ];

    this.process = spawn(kubectlBin, args, {
      env: process.env,
    });
    PortForward.portForwards.push(this);
    this.process.on("exit", () => {
      const index = PortForward.portForwards.indexOf(this);

      if (index > -1) {
        PortForward.portForwards.splice(index, 1);
      }
    });

    this.process.stderr.on("data", (data) => {
      logger.warn(`[PORT-FORWARD-ROUTE]: kubectl port-forward process stderr: ${data}`);
    });

    const internalPort = await getPortFrom(this.process.stdout, {
      lineRegex: internalPortRegex,
    });

    try {
      await tcpPortUsed.waitUntilUsed(internalPort, 500, 15000);

      // make sure this.forwardPort is set to the actual port used (if it was 0 then an available port is found by 'kubectl port-forward')
      this.forwardPort = internalPort;

      return true;
    } catch (error) {
      this.process.kill();

      return false;
    }
  }

  public async stop() {
    this.process.kill();
  }
}

export class PortForwardRoute {
  static async routePortForward(request: LensApiRequest) {
    const { params, query, response, cluster } = request;
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));
    const protocol = query.get("protocol");

    try {
      let portForward = PortForward.getPortforward({
        clusterId: cluster.id, kind: resourceType, name: resourceName,
        namespace, port, forwardPort, protocol,
      });

      if (!portForward) {
        logger.info(`Creating a new port-forward ${namespace}/${resourceType}/${resourceName}:${port}`);

        const thePort = 0 < forwardPort && forwardPort < 65536 
          ? forwardPort 
          : 0;
          
        portForward = new PortForward(await cluster.getProxyKubeconfigPath(), {
          clusterId: cluster.id,
          kind: resourceType,
          namespace,
          name: resourceName,
          port,
          forwardPort: thePort,
          protocol,
        });

        const started = await portForward.start();

        if (!started) {
          logger.error("[PORT-FORWARD-ROUTE]: failed to start a port-forward", { namespace, port, resourceType, resourceName });

          return respondJson(response, {
            message: `Failed to forward port ${port} to ${thePort ? forwardPort : "random port"}`,
          }, 400);
        }
      }

      respondJson(response, { port: portForward.forwardPort });
    } catch (error) {
      logger.error(`[PORT-FORWARD-ROUTE]: failed to open a port-forward: ${error}`, { namespace, port, resourceType, resourceName });

      return respondJson(response, {
        message: `Failed to forward port ${port}`,
      }, 400);
    }
  }

  static async routeCurrentPortForward(request: LensApiRequest) {
    const { params, query, response, cluster } = request;
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));
    const protocol = query.get("protocol");

    const portForward = PortForward.getPortforward({
      clusterId: cluster.id, kind: resourceType, name: resourceName,
      namespace, port, forwardPort, protocol,
    });

    respondJson(response, { port: portForward?.forwardPort ?? null });
  }

  static async routeAllPortForwards(request: LensApiRequest) {
    const { response } = request;

    const portForwards: PortForwardArgs[] = PortForward.portForwards.map(f => (
      {
        clusterId: f.clusterId,
        kind: f.kind,
        namespace: f.namespace,
        name: f.name,
        port: f.port,
        forwardPort: f.forwardPort,
        protocol: f.protocol,
      }),
    );

    respondJson(response, { portForwards });
  }

  static async routeCurrentPortForwardStop(request: LensApiRequest) {
    const { params, query, response, cluster } = request;
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));

    const portForward = PortForward.getPortforward({
      clusterId: cluster.id, kind: resourceType, name: resourceName,
      namespace, port, forwardPort,
    });

    try {
      await portForward.stop();
      respondJson(response, { status: true });
    } catch (error) {
      logger.error("[PORT-FORWARD-ROUTE]: error stopping a port-forward", { namespace, port, forwardPort, resourceType, resourceName });

      return respondJson(response, {
        message: `error stopping a forward port ${port}`,
      }, 400);
    }
  }
}

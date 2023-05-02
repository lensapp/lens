/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { GetPortFromStream } from "../../../utils/get-port-from-stream.injectable";
import type { ChildProcessWithoutNullStreams } from "child_process";
import { spawn } from "child_process";
import * as tcpPortUsed from "tcp-port-used";
import { TypedRegEx } from "typed-regex";
import type { Logger } from "@k8slens/logger";

const internalPortMatcher = "^forwarding from (?<address>.+) ->";
const internalPortRegex = Object.assign(TypedRegEx(internalPortMatcher, "i"), {
  rawMatcher: internalPortMatcher,
});

export interface PortForwardArgs {
  clusterId: string;
  kind: string;
  namespace: string;
  name: string;
  port: number;
  forwardPort: number;
}

export interface PortForwardDependencies {
  readonly logger: Logger;
  getKubectlBinPath: (bundled: boolean) => Promise<string>;
  getPortFromStream: GetPortFromStream;
}

export class PortForward {
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

  public process?: ChildProcessWithoutNullStreams;
  public clusterId: string;
  public kind: string;
  public namespace: string;
  public name: string;
  public port: number;
  public forwardPort: number;

  constructor(private dependencies: PortForwardDependencies, public pathToKubeConfig: string, args: PortForwardArgs) {
    this.clusterId = args.clusterId;
    this.kind = args.kind;
    this.namespace = args.namespace;
    this.name = args.name;
    this.port = args.port;
    this.forwardPort = args.forwardPort;
  }

  public async start() {
    const kubectlBin = await this.dependencies.getKubectlBinPath(true);
    const args = [
      "--kubeconfig", this.pathToKubeConfig,
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
      this.dependencies.logger.debug(`[PORT-FORWARD-ROUTE]: kubectl port-forward process stderr: ${data}`);
    });

    const internalPort = await this.dependencies.getPortFromStream(this.process.stdout, {
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
    this.process?.kill();
  }
}

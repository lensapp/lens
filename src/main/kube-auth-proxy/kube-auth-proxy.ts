/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ChildProcess, spawn } from "child_process";
import { waitUntilUsed } from "tcp-port-used";
import { randomBytes } from "crypto";
import type { Cluster } from "../../common/cluster/cluster";
import logger from "../logger";
import * as url from "url";
import { getPortFrom } from "../utils/get-port";
import { makeObservable, observable, when } from "mobx";

const startingServeRegex = /^starting to serve on (?<address>.+)/i;

interface Dependencies {
  getProxyBinPath: () => Promise<string>;
}

export class KubeAuthProxy {
  public readonly apiPrefix = `/${randomBytes(8).toString("hex")}`;

  public get port(): number {
    return this._port;
  }

  protected _port: number;
  protected proxyProcess?: ChildProcess;
  protected readonly acceptHosts: string;
  @observable protected ready = false;

  constructor(private dependencies: Dependencies, protected readonly cluster: Cluster, protected readonly env: NodeJS.ProcessEnv) {
    makeObservable(this);

    this.acceptHosts = url.parse(this.cluster.apiUrl).hostname;
  }

  get whenReady() {
    return when(() => this.ready);
  }

  public async run(): Promise<void> {
    if (this.proxyProcess) {
      return this.whenReady;
    }

    const proxyBin = await this.dependencies.getProxyBinPath();
    const args = [
      "proxy",
      "-p", "0",
      "--kubeconfig", `${this.cluster.kubeConfigPath}`,
      "--context", `${this.cluster.contextName}`,
      "--accept-hosts", this.acceptHosts,
      "--reject-paths", "^[^/]",
      "--api-prefix", this.apiPrefix,
    ];

    if (process.env.DEBUG_PROXY === "true") {
      args.push("-v", "9");
    }
    logger.debug(`spawning kubectl proxy with args: ${args}`);

    this.proxyProcess = spawn(proxyBin, args, { env: this.env });
    this.proxyProcess.on("error", (error) => {
      this.cluster.broadcastConnectUpdate(error.message, true);
      this.exit();
    });

    this.proxyProcess.on("exit", (code) => {
      this.cluster.broadcastConnectUpdate(`proxy exited with code: ${code}`, code > 0);
      this.exit();
    });

    this.proxyProcess.on("disconnect", () => {
      this.cluster.broadcastConnectUpdate("Proxy disconnected communications", true );
      this.exit();
    });

    this.proxyProcess.stderr.on("data", (data) => {
      this.cluster.broadcastConnectUpdate(data.toString(), true);
    });

    this.proxyProcess.stdout.on("data", (data: any) => {
      if (typeof this._port === "number") {
        this.cluster.broadcastConnectUpdate(data.toString());
      }
    });

    this._port = await getPortFrom(this.proxyProcess.stdout, {
      lineRegex: startingServeRegex,
      onFind: () => this.cluster.broadcastConnectUpdate("Authentication proxy started"),
    });

    try {
      await waitUntilUsed(this.port, 500, 10000);
      this.ready = true;
    } catch (error) {
      this.cluster.broadcastConnectUpdate("Proxy port failed to be used within timelimit, restarting...", true);
      this.exit();

      return this.run();
    }
  }

  public exit() {
    this.ready = false;

    if (this.proxyProcess) {
      logger.debug("[KUBE-AUTH]: stopping local proxy", this.cluster.getMeta());
      this.proxyProcess.removeAllListeners();
      this.proxyProcess.stderr.removeAllListeners();
      this.proxyProcess.stdout.removeAllListeners();
      this.proxyProcess.kill();
      this.proxyProcess = null;
    }
  }
}

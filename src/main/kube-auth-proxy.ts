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

import { ChildProcess, spawn } from "child_process";
import { waitUntilUsed } from "tcp-port-used";
import { randomBytes } from "crypto";
import { broadcastMessage } from "../common/ipc";
import type { Cluster } from "./cluster";
import { Kubectl } from "./kubectl";
import logger from "./logger";
import * as url from "url";
import { getPortFrom } from "./utils/get-port";
import { makeObservable, observable, when } from "mobx";

export interface KubeAuthProxyLog {
  data: string;
  error?: boolean; // stream=stderr
}

const startingServeRegex = /^starting to serve on (?<address>.+)/i;

export class KubeAuthProxy {
  public lastError: string;
  public readonly apiPrefix: string;

  public get port(): number {
    return this._port;
  }

  protected _port: number;
  protected cluster: Cluster;
  protected env: NodeJS.ProcessEnv = null;
  protected proxyProcess: ChildProcess;
  protected kubectl: Kubectl;
  @observable protected ready: boolean;

  constructor(cluster: Cluster, env: NodeJS.ProcessEnv) {
    makeObservable(this);
    this.ready = false;
    this.env = env;
    this.cluster = cluster;
    this.kubectl = Kubectl.bundled();
    this.apiPrefix = `/${randomBytes(8).toString("hex")}`;
  }

  get acceptHosts() {
    return url.parse(this.cluster.apiUrl).hostname;
  }

  get whenReady() {
    return when(() => this.ready);
  }

  public async run(): Promise<void> {
    if (this.proxyProcess) {
      return this.whenReady;
    }

    const proxyBin = await this.kubectl.getPath();
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
      this.sendIpcLogMessage({ data: error.message, error: true });
      this.exit();
    });

    this.proxyProcess.on("exit", (code) => {
      this.sendIpcLogMessage({ data: `proxy exited with code: ${code}`, error: code > 0 });
      this.exit();
    });

    this.proxyProcess.stderr.on("data", (data) => {
      this.lastError = this.parseError(data.toString());
      this.sendIpcLogMessage({ data: data.toString(), error: true });
    });

    this._port = await getPortFrom(this.proxyProcess.stdout, {
      lineRegex: startingServeRegex,
      onFind: () => this.sendIpcLogMessage({ data: "Authentication proxy started\n" }),
    });

    this.proxyProcess.stdout.on("data", (data: any) => {
      this.sendIpcLogMessage({ data: data.toString() });
    });

    await waitUntilUsed(this.port, 500, 10000);

    this.ready = true;
  }

  protected parseError(data: string) {
    const error = data.split("http: proxy error:").slice(1).join("").trim();
    let errorMsg = error;
    const jsonError = error.split("Response: ")[1];

    if (jsonError) {
      try {
        const parsedError = JSON.parse(jsonError);

        errorMsg = parsedError.error_description || parsedError.error || jsonError;
      } catch (_) {
        errorMsg = jsonError.trim();
      }
    }

    return errorMsg;
  }

  protected sendIpcLogMessage(res: KubeAuthProxyLog) {
    const channel = `kube-auth:${this.cluster.id}`;

    logger.info(`[KUBE-AUTH]: out-channel "${channel}"`, { ...res, meta: this.cluster.getMeta() });
    broadcastMessage(channel, res);
  }

  public exit() {
    this.ready = false;
    if (!this.proxyProcess) return;
    logger.debug("[KUBE-AUTH]: stopping local proxy", this.cluster.getMeta());
    this.proxyProcess.kill();
    this.proxyProcess.removeAllListeners();
    this.proxyProcess.stderr.removeAllListeners();
    this.proxyProcess.stdout.removeAllListeners();
    this.proxyProcess = null;
  }
}

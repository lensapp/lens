/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ChildProcess } from "child_process";
import { randomBytes } from "crypto";
import type { Cluster } from "../../common/cluster/cluster";
import type { GetPortFromStream } from "../utils/get-port-from-stream.injectable";
import { observable, when } from "mobx";
import type { SelfSignedCert } from "selfsigned";
import assert from "assert";
import { TypedRegEx } from "typed-regex";
import type { Spawn } from "../child-process/spawn.injectable";
import type { Logger } from "../../common/logger";
import type { WaitUntilPortIsUsed } from "./wait-until-port-is-used/wait-until-port-is-used.injectable";
import type { GetDirnameOfPath } from "../../common/path/get-dirname.injectable";
import type { BroadcastConnectionUpdate } from "../cluster/broadcast-connection-update.injectable";
import type { KubeAuthProxy } from "./create-kube-auth-proxy.injectable";

const startingServeMatcher = "starting to serve on (?<address>.+)";
const startingServeRegex = Object.assign(TypedRegEx(startingServeMatcher, "i"), {
  rawMatcher: startingServeMatcher,
});

export interface KubeAuthProxyDependencies {
  readonly proxyBinPath: string;
  readonly proxyCert: SelfSignedCert;
  readonly logger: Logger;
  spawn: Spawn;
  waitUntilPortIsUsed: WaitUntilPortIsUsed;
  getPortFromStream: GetPortFromStream;
  dirname: GetDirnameOfPath;
  broadcastConnectionUpdate: BroadcastConnectionUpdate;
}

export class KubeAuthProxyImpl implements KubeAuthProxy {
  public readonly apiPrefix = `/${randomBytes(8).toString("hex")}`;

  public get port(): number {
    const port = this._port;

    assert(port, "port has not yet been initialized");

    return port;
  }

  protected _port?: number;
  protected proxyProcess?: ChildProcess;
  protected readonly ready = observable.box(false);

  constructor(
    private readonly dependencies: KubeAuthProxyDependencies,
    protected readonly cluster: Cluster,
    protected readonly env: NodeJS.ProcessEnv,
  ) {}

  public async run(): Promise<void> {
    if (this.proxyProcess) {
      return when(() => this.ready.get());
    }

    const proxyBin = this.dependencies.proxyBinPath;
    const cert = this.dependencies.proxyCert;

    this.proxyProcess = this.dependencies.spawn(proxyBin, [], {
      env: {
        ...this.env,
        KUBECONFIG: this.cluster.kubeConfigPath.get(),
        KUBECONFIG_CONTEXT: this.cluster.contextName.get(),
        API_PREFIX: this.apiPrefix,
        PROXY_KEY: cert.private,
        PROXY_CERT: cert.cert,
      },
      cwd: this.dependencies.dirname(this.cluster.kubeConfigPath.get()),
    });
    this.proxyProcess.on("error", (error) => {
      this.dependencies.broadcastConnectionUpdate({
        level: "error",
        message: error.message,
      });
      this.exit();
    });

    this.proxyProcess.on("exit", (code) => {
      if (code) {
        this.dependencies.broadcastConnectionUpdate({
          level: "error",
          message: `proxy exited with code: ${code}`,
        });
      } else {
        this.dependencies.broadcastConnectionUpdate({
          level: "info",
          message: "proxy exited successfully",
        });
      }
      this.exit();
    });

    this.proxyProcess.on("disconnect", () => {
      this.dependencies.broadcastConnectionUpdate({
        level: "error",
        message: "Proxy disconnected communications",
      });
      this.exit();
    });

    assert(this.proxyProcess.stderr);
    assert(this.proxyProcess.stdout);

    this.proxyProcess.stderr.on("data", (data: Buffer) => {
      if (data.includes("http: TLS handshake error")) {
        return;
      }

      this.dependencies.broadcastConnectionUpdate({
        level: "error",
        message: data.toString(),
      });
    });

    this.proxyProcess.stdout.on("data", (data: Buffer) => {
      if (typeof this._port === "number") {
        this.dependencies.broadcastConnectionUpdate({
          level: "info",
          message: data.toString(),
        });
      }
    });

    this._port = await this.dependencies.getPortFromStream(this.proxyProcess.stdout, {
      lineRegex: startingServeRegex,
      onFind: () => this.dependencies.broadcastConnectionUpdate({
        level: "info",
        message: "Authentication proxy started",
      }),
    });

    this.dependencies.logger.info(`[KUBE-AUTH-PROXY]: found port=${this._port}`);

    try {
      await this.dependencies.waitUntilPortIsUsed(this.port, 500, 10000);
      this.ready.set(true);
    } catch (error) {
      this.dependencies.logger.warn("[KUBE-AUTH-PROXY]: waitUntilUsed failed", error);
      this.dependencies.broadcastConnectionUpdate({
        level: "error",
        message: "Proxy port failed to be used within time limit, restarting...",
      });
      this.exit();

      return this.run();
    }
  }

  public exit() {
    this.ready.set(false);

    if (this.proxyProcess) {
      this.dependencies.logger.debug("[KUBE-AUTH]: stopping local proxy", this.cluster.getMeta());
      this.proxyProcess.removeAllListeners();
      this.proxyProcess.stderr?.removeAllListeners();
      this.proxyProcess.stdout?.removeAllListeners();
      this.proxyProcess.kill();
      this.proxyProcess = undefined;
    }
  }
}

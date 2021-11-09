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

import fse from "fs-extra";
import type { Cluster } from "../cluster";
import { Kubectl } from "../kubectl";
import type WebSocket from "ws";
import { shellEnv } from "../utils/shell-env";
import { app } from "electron";
import { clearKubeconfigEnvVars } from "../utils/clear-kube-env-vars";
import path from "path";
import { isWindows } from "../../common/vars";
import { UserStore } from "../../common/user-store";
import * as pty from "node-pty";
import { appEventBus } from "../../common/event-bus";
import logger from "../logger";

export class ShellOpenError extends Error {
  constructor(message: string, public cause: Error) {
    super(`${message}: ${cause}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this);
  }
}

export enum WebSocketCloseEvent {
  /**
   * The connection successfully completed the purpose for which it was created.
   */
  NormalClosure = 1000,
  /**
   * The endpoint is going away, either because of a server failure or because
   * the browser is navigating away from the page that opened the connection.
   */
  GoingAway = 1001,
  /**
   * The endpoint is terminating the connection due to a protocol error.
   */
  ProtocolError = 1002,
  /**
   * The connection is being terminated because the endpoint received data of a
   * type it cannot accept. (For example, a text-only endpoint received binary
   * data.)
   */
  UnsupportedData = 1003,
  /**
   * Indicates that no status code was provided even though one was expected.
   */
  NoStatusReceived = 1005,
  /**
   * Indicates that a connection was closed abnormally (that is, with no close
   * frame being sent) when a status code is expected.
   */
  AbnormalClosure = 1006,
  /**
   *  The endpoint is terminating the connection because a message was received
   * that contained inconsistent data (e.g., non-UTF-8 data within a text message).
   */
  InvalidFramePayloadData = 1007,
  /**
   * The endpoint is terminating the connection because it received a message
   * that violates its policy. This is a generic status code, used when codes
   * 1003 and 1009 are not suitable.
   */
  PolicyViolation = 1008,
  /**
   * The endpoint is terminating the connection because a data frame was
   * received that is too large.
   */
  MessageTooBig = 1009,
  /**
   * The client is terminating the connection because it expected the server to
   * negotiate one or more extension, but the server didn't.
   */
  MissingExtension = 1010,
  /**
   * The server is terminating the connection because it encountered an
   * unexpected condition that prevented it from fulfilling the request.
   */
  InternalError = 1011,
  /**
   * The server is terminating the connection because it is restarting.
   */
  ServiceRestart = 1012,
  /**
   * The server is terminating the connection due to a temporary condition,
   * e.g. it is overloaded and is casting off some of its clients.
   */
  TryAgainLater = 1013,
  /**
   * The server was acting as a gateway or proxy and received an invalid
   * response from the upstream server. This is similar to 502 HTTP Status Code.
   */
  BadGateway = 1014,
  /**
   * Indicates that the connection was closed due to a failure to perform a TLS
   * handshake (e.g., the server certificate can't be verified).
   */
  TlsHandshake = 1015,
}

export abstract class ShellSession {
  abstract ShellType: string;

  private static shellEnvs = new Map<string, Record<string, string>>();
  private static processes = new Map<string, pty.IPty>();

  /**
   * Kill all remaining shell backing processes. Should be called when about to
   * quit
   */
  public static cleanup(): void {
    for (const shellProcess of this.processes.values()) {
      try {
        process.kill(shellProcess.pid);
      } catch {}
    }

    this.processes.clear();
  }

  protected kubectl: Kubectl;
  protected running = false;
  protected kubectlBinDirP: Promise<string>;
  protected kubeconfigPathP: Promise<string>;
  protected readonly terminalId: string;

  protected abstract get cwd(): string | undefined;

  protected ensureShellProcess(shell: string, args: string[], env: Record<string, string>, cwd: string): pty.IPty {
    if (!ShellSession.processes.has(this.terminalId)) {
      ShellSession.processes.set(this.terminalId, pty.spawn(shell, args, {
        cols: 80,
        cwd,
        env,
        name: "xterm-256color",
        rows: 30,
      }));
    }

    return ShellSession.processes.get(this.terminalId);
  }

  constructor(protected websocket: WebSocket, protected cluster: Cluster, terminalId: string) {
    this.kubectl = new Kubectl(cluster.version);
    this.kubeconfigPathP = this.cluster.getProxyKubeconfigPath();
    this.kubectlBinDirP = this.kubectl.binDir();
    this.terminalId = `${cluster.id}:${terminalId}`;
  }

  protected async openShellProcess(shell: string, args: string[], env: Record<string, any>) {
    const cwd = (this.cwd && await fse.pathExists(this.cwd))
    	? this.cwd
    	: env.HOME;
    const shellProcess = this.ensureShellProcess(shell, args, env, cwd);

    this.running = true;
    shellProcess.onData(data => this.sendResponse(data));
    shellProcess.onExit(({ exitCode }) => {
      this.running = false;

      if (exitCode > 0) {
        this.sendResponse("Terminal will auto-close in 15 seconds ...");
        setTimeout(() => this.exit(), 15 * 1000);
      } else {
        this.exit();
      }
    });

    this.websocket
      .on("message", (data: string) => {
        if (!this.running) {
          return;
        }

        const message = Buffer.from(data.slice(1, data.length), "base64").toString();

        switch (data[0]) {
          case "0":
            shellProcess.write(message);
            break;
          case "4":
            const { Width, Height } = JSON.parse(message);

            shellProcess.resize(Width, Height);
            break;
        }
      })
      .on("close", (code) => {
        logger.debug(`[SHELL-SESSION]: websocket for ${this.terminalId} closed with code=${code}`);

        if (this.running && code !== WebSocketCloseEvent.AbnormalClosure) {
          // This code is the one that gets sent when the network is turned off
          try {
            logger.info(`[SHELL-SESSION]: Killing shell process for ${this.terminalId}`);
            process.kill(shellProcess.pid);
            ShellSession.processes.delete(this.terminalId);
          } catch (e) {
          }
          this.running = false;
        }
      });

    appEventBus.emit({ name: this.ShellType, action: "open" });
  }

  protected getPathEntries(): string[] {
    return [];
  }

  protected async getCachedShellEnv() {
    const { id: clusterId } = this.cluster;

    let env = ShellSession.shellEnvs.get(clusterId);

    if (!env) {
      env = await this.getShellEnv();
      ShellSession.shellEnvs.set(clusterId, env);
    } else {
      // refresh env in the background
      this.getShellEnv().then((shellEnv: any) => {
        ShellSession.shellEnvs.set(clusterId, shellEnv);
      });
    }

    return env;
  }

  protected async getShellEnv() {
    const env = clearKubeconfigEnvVars(JSON.parse(JSON.stringify(await shellEnv())));
    const pathStr = [...this.getPathEntries(), await this.kubectlBinDirP, process.env.PATH].join(path.delimiter);
    const shell = UserStore.getInstance().resolvedShell;

    delete env.DEBUG; // don't pass DEBUG into shells

    if (isWindows) {
      env.SystemRoot = process.env.SystemRoot;
      env.PTYSHELL = shell || "powershell.exe";
      env.PATH = pathStr;
      env.LENS_SESSION = "true";
      env.WSLENV = [
        process.env.WSLENV,
        "KUBECONFIG/up:LENS_SESSION/u",
      ]
        .filter(Boolean)
        .join(":");
    } else if (shell !== undefined) {
      env.PTYSHELL = shell;
      env.PATH = pathStr;
    } else {
      env.PTYSHELL = ""; // blank runs the system default shell
    }

    if (path.basename(env.PTYSHELL) === "zsh") {
      env.OLD_ZDOTDIR = env.ZDOTDIR || env.HOME;
      env.ZDOTDIR = await this.kubectlBinDirP;
      env.DISABLE_AUTO_UPDATE = "true";
    }

    env.PTYPID = process.pid.toString();
    env.KUBECONFIG = await this.kubeconfigPathP;
    env.TERM_PROGRAM = app.getName();
    env.TERM_PROGRAM_VERSION = app.getVersion();

    if (this.cluster.preferences.httpsProxy) {
      env.HTTPS_PROXY = this.cluster.preferences.httpsProxy;
    }

    env.NO_PROXY = [
      "localhost",
      "127.0.0.1",
      env.NO_PROXY,
    ]
      .filter(Boolean)
      .join();

    return env;
  }

  protected exit(code = WebSocketCloseEvent.NormalClosure) {
    if (this.websocket.readyState == this.websocket.OPEN) {
      this.websocket.close(code);
    }
  }

  protected sendResponse(msg: string) {
    this.websocket.send(`1${Buffer.from(msg).toString("base64")}`);
  }
}

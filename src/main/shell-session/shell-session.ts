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
import type * as WebSocket from "ws";
import { shellEnv } from "../utils/shell-env";
import { app } from "electron";
import { clearKubeconfigEnvVars } from "../utils/clear-kube-env-vars";
import path from "path";
import { isWindows } from "../../common/vars";
import { UserStore } from "../../common/user-store";
import * as pty from "node-pty";
import { appEventBus } from "../../common/event-bus";

export class ShellOpenError extends Error {
  constructor(message: string, public cause: Error) {
    super(`${message}: ${cause}`);
    this.name = this.constructor.name;
    Error.captureStackTrace(this);
  }
}

export abstract class ShellSession {
  abstract ShellType: string;

  static shellEnvs: Map<string, Record<string, any>> = new Map();

  protected kubectl: Kubectl;
  protected running = false;
  protected shellProcess: pty.IPty;
  protected kubectlBinDirP: Promise<string>;
  protected kubeconfigPathP: Promise<string>;

  protected abstract get cwd(): string | undefined;

  constructor(protected websocket: WebSocket, protected cluster: Cluster) {
    this.kubectl = new Kubectl(cluster.version);
    this.kubeconfigPathP = this.cluster.getProxyKubeconfigPath();
    this.kubectlBinDirP = this.kubectl.binDir();
  }

  protected async open(shell: string, args: string[], env: Record<string, any>) {
    const cwd = (this.cwd && await fse.pathExists(this.cwd))
    	? this.cwd
    	: env.HOME;

    this.shellProcess = pty.spawn(shell, args, {
      cols: 80,
      cwd,
      env,
      name: "xterm-256color",
      rows: 30,
    });
    this.running = true;

    this.shellProcess.onData(data => this.sendResponse(data));
    this.shellProcess.onExit(({ exitCode }) => {
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
            this.shellProcess.write(message);
            break;
          case "4":
            const { Width, Height } = JSON.parse(message);

            this.shellProcess.resize(Width, Height);
            break;
        }
      })
      .on("close", () => {
        if (this.running) {
          try {
            process.kill(this.shellProcess.pid);
          } catch (e) {
          }
        }

        this.running = false;
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

  protected exit(code = 1000) {
    if (this.websocket.readyState == this.websocket.OPEN) {
      this.websocket.close(code);
    }
  }

  protected sendResponse(msg: string) {
    this.websocket.send(`1${Buffer.from(msg).toString("base64")}`);
  }
}

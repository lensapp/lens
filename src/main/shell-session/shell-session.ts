import { ClusterId, ClusterPreferences } from "../../common/cluster-store";
import { Cluster } from "../cluster";
import * as pty from "node-pty";
import * as WebSocket from "ws";
import { EventEmitter } from "events";
import { Kubectl } from "../kubectl";
import { isWindows } from "../../common/vars";

export type EnvVarMap = Record<string, string>;

/**
 * Joins all the non-empty elements of `parts` using `sep` between each element
 * @param parts the potential elements for the new ENV var multi-element value
 * @param sep The separator to join the elements together
 */
function joinEnvParts(parts: (string | null | undefined)[], sep: string): string {
  return parts.filter(Boolean).join(sep);
}

export abstract class ShellSession extends EventEmitter {
  protected abstract readonly EventName: string;
  protected static readonly ShellEnvs = new Map<ClusterId, EnvVarMap>();
  protected running = false;
  protected shellProcess: pty.IPty;
  protected readonly kubeconfigPath: string;
  protected readonly kubectl: Kubectl;

  protected get clusterId(): ClusterId {
    return this.cluster.id;
  }

  protected get preferences(): ClusterPreferences {
    return this.cluster.preferences || {};
  }

  protected cwd(env: EnvVarMap): string {
    return this.preferences?.terminalCWD || env.HOME;
  }

  constructor(protected websocket: WebSocket, protected cluster: Cluster) {
    super();
    this.kubeconfigPath = cluster.getProxyKubeconfigPath();
    this.kubectl = new Kubectl(cluster.version);
  }

  protected async getCachedShellEnv(): Promise<EnvVarMap> {
    if (!ShellSession.ShellEnvs.has(this.clusterId)) {
      ShellSession.ShellEnvs.set(this.clusterId, await this.getShellEnv());
    } else {
      // refresh env in the background
      this.getShellEnv()
        .then(shellEnv => {
          ShellSession.ShellEnvs.set(this.clusterId, shellEnv);
        });
    }

    return ShellSession.ShellEnvs.get(this.clusterId);
  }

  protected async getShellEnv(): Promise<EnvVarMap> {
    const env = JSON.parse(JSON.stringify(await shellEnv()));
    const pathStr = joinEnvParts([this.kubectlBinDir, this.helmBinDir, process.env.PATH], path.delimiter);

    if (isWindows) {
      env["SystemRoot"] = process.env.SystemRoot;
      env["PTYSHELL"] = process.env.SHELL || "powershell.exe";
      env["PATH"] = pathStr;
      env["LENS_SESSION"] = "true";
      env["WSLENV"] = joinEnvParts([env["WSLENV"], "KUBECONFIG/up:LENS_SESSION/u"], ":");
    } else {
      env["PTYSHELL"] = process.env.SHELL ?? ""; // blank runs the system default shell
      env["PATH"] = pathStr;
    }

    if (path.basename(env["PTYSHELL"]) === "zsh") {
      env["OLD_ZDOTDIR"] = env.ZDOTDIR || env.HOME;
      env["ZDOTDIR"] = this.kubectlBinDir;
      env["DISABLE_AUTO_UPDATE"] = "true";
    }

    env["PTYPID"] = process.pid.toString();
    env["KUBECONFIG"] = this.kubeconfigPath;
    env["TERM_PROGRAM"] = app.getName();
    env["TERM_PROGRAM_VERSION"] = app.getVersion();

    if (this.preferences.httpsProxy) {
      env["HTTPS_PROXY"] = this.preferences.httpsProxy;
    }

    env["WSLENV"] = joinEnvParts(["localhost", "127.0.0.1", env["NO_PROXY"]], ",");
    delete env["DEBUG"];

    return env;
  }
}

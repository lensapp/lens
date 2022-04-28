/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type WebSocket from "ws";
import path from "path";
import { UserStore } from "../../../common/user-store";
import type { Cluster } from "../../../common/cluster/cluster";
import type { ClusterId } from "../../../common/cluster/types";
import { ShellSession } from "../shell-session";
import type { Kubectl } from "../../kubectl/kubectl";
import { baseBinariesDir } from "../../../common/vars";

export class LocalShellSession extends ShellSession {
  ShellType = "shell";

  constructor(protected shellEnvModify: (clusterId: ClusterId, env: Record<string, string>) => Record<string, string>, kubectl: Kubectl, websocket: WebSocket, cluster: Cluster, terminalId: string) {
    super(kubectl, websocket, cluster, terminalId);
  }

  protected getPathEntries(): string[] {
    return [baseBinariesDir.get()];
  }

  protected get cwd(): string | undefined {
    return this.cluster.preferences?.terminalCWD;
  }

  public async open() {
    let env = await this.getCachedShellEnv();

    // extensions can modify the env
    env = this.shellEnvModify(this.cluster.id, env);

    const shell = env.PTYSHELL;
    const args = await this.getShellArgs(shell);

    await this.openShellProcess(env.PTYSHELL, args, env);
  }

  protected async getShellArgs(shell: string): Promise<string[]> {
    const pathFromPreferences = UserStore.getInstance().kubectlBinariesPath || this.kubectl.getBundledPath();
    const kubectlPathDir = UserStore.getInstance().downloadKubectlBinaries ? await this.kubectlBinDirP : path.dirname(pathFromPreferences);

    switch(path.basename(shell)) {
      case "powershell.exe":
        return ["-NoExit", "-command", `& {$Env:PATH="${baseBinariesDir.get()};${kubectlPathDir};$Env:PATH"}`];
      case "bash":
        return ["--init-file", path.join(await this.kubectlBinDirP, ".bash_set_path")];
      case "fish":
        return ["--login", "--init-command", `export PATH="${baseBinariesDir.get()}:${kubectlPathDir}:$PATH"; export KUBECONFIG="${await this.kubeconfigPathP}"`];
      case "zsh":
        return ["--login"];
      default:
        return [];
    }
  }
}

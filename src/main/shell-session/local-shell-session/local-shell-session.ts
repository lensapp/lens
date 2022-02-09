/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type WebSocket from "ws";
import path from "path";
import { helmCli } from "../../helm/helm-cli";
import { UserStore } from "../../../common/user-store";
import type { Cluster } from "../../../common/cluster/cluster";
import { ShellSession } from "../shell-session";
import type { Kubectl } from "../../kubectl/kubectl";
import type { ShellEnvModifier } from "../shell-env-modifier/shell-env-modifier-registration";
import type { CatalogEntity } from "../../../common/catalog";

export class LocalShellSession extends ShellSession {
  ShellType = "shell";

  constructor(protected shellEnvModifiers: ShellEnvModifier[], protected entity: CatalogEntity, kubectl: Kubectl, websocket: WebSocket, cluster: Cluster, terminalId: string) {
    super(kubectl, websocket, cluster, terminalId);
  }
  
  protected getPathEntries(): string[] {
    return [helmCli.getBinaryDir()];
  }

  protected get cwd(): string | undefined {
    return this.cluster.preferences?.terminalCWD;
  }

  public async open() {
    let env = await this.getCachedShellEnv();
  
    if (this.entity) {
      const ctx = { catalogEntity: this.entity };

      env = JSON.parse(JSON.stringify(this.shellEnvModifiers.reduce((env, modifier) => modifier(ctx, env), env)));
    }

    const shell = env.PTYSHELL;
    const args = await this.getShellArgs(shell);

    await this.openShellProcess(env.PTYSHELL, args, env);
  }

  protected async getShellArgs(shell: string): Promise<string[]> {
    const helmpath = helmCli.getBinaryDir();
    const pathFromPreferences = UserStore.getInstance().kubectlBinariesPath || this.kubectl.getBundledPath();
    const kubectlPathDir = UserStore.getInstance().downloadKubectlBinaries ? await this.kubectlBinDirP : path.dirname(pathFromPreferences);

    switch(path.basename(shell)) {
      case "powershell.exe":
        return ["-NoExit", "-command", `& {$Env:PATH="${helmpath};${kubectlPathDir};$Env:PATH"}`];
      case "bash":
        return ["--init-file", path.join(await this.kubectlBinDirP, ".bash_set_path")];
      case "fish":
        return ["--login", "--init-command", `export PATH="${helmpath}:${kubectlPathDir}:$PATH"; export KUBECONFIG="${await this.kubeconfigPathP}"`];
      case "zsh":
        return ["--login"];
      default:
        return [];
    }
  }
}

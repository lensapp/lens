/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { UserStore } from "../../../common/user-store";
import type { ClusterId } from "../../../common/cluster-types";
import type { ShellSessionArgs, ShellSessionDependencies } from "../shell-session";
import { ShellSession } from "../shell-session";
import { baseBinariesDir } from "../../../common/vars";

interface LocalShellSessionDependencies extends ShellSessionDependencies {
  modifyTerminalShellEnv: (clusterId: ClusterId, env: Record<string, string | undefined>) => Record<string, string | undefined>;
}

export class LocalShellSession extends ShellSession {
  ShellType = "shell";

  constructor(protected readonly dependencies: LocalShellSessionDependencies, args: ShellSessionArgs) {
    super(dependencies, args);
  }

  protected getPathEntries(): string[] {
    return [baseBinariesDir.get()];
  }

  protected get cwd(): string | undefined {
    return this.cluster.preferences?.terminalCWD;
  }

  public async open() {
    // extensions can modify the env
    const env = this.dependencies.modifyTerminalShellEnv(this.cluster.id, await this.getCachedShellEnv());
    const shell = env.PTYSHELL;

    if (!shell) {
      throw new Error("PTYSHELL is not defined with the environment");
    }

    const args = await this.getShellArgs(shell);

    await this.openShellProcess(shell, args, env);
  }

  protected async getShellArgs(shell: string): Promise<string[]> {
    const pathFromPreferences = UserStore.getInstance().kubectlBinariesPath || this.kubectl.getBundledPath();
    const kubectlPathDir = UserStore.getInstance().downloadKubectlBinaries ? await this.kubectlBinDirP : path.dirname(pathFromPreferences);

    switch(path.basename(shell)) {
      case "powershell.exe":
        return ["-NoExit", "-command", `& {$Env:PATH="${kubectlPathDir};${baseBinariesDir.get()};$Env:PATH"}`];
      case "bash":
        return ["--init-file", path.join(await this.kubectlBinDirP, ".bash_set_path")];
      case "fish":
        return ["--login", "--init-command", `export PATH="${kubectlPathDir}:${baseBinariesDir.get()}:$PATH"; export KUBECONFIG="${await this.kubeconfigPathP}"`];
      case "zsh":
        return ["--login"];
      default:
        return [];
    }
  }
}

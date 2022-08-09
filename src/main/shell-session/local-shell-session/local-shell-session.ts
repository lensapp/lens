/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import type { UserStore } from "../../../common/user-store";
import type { ShellSessionArgs, ShellSessionDependencies } from "../shell-session";
import { ShellSession } from "../shell-session";
import type { ModifyTerminalShellEnv } from "../shell-env-modifier/modify-terminal-shell-env.injectable";

export interface LocalShellSessionDependencies extends ShellSessionDependencies {
  modifyTerminalShellEnv: ModifyTerminalShellEnv;
  readonly directoryForBinaries: string;
  readonly userStore: UserStore;
}

export class LocalShellSession extends ShellSession {
  ShellType = "shell";

  constructor(protected readonly dependencies: LocalShellSessionDependencies, args: ShellSessionArgs) {
    super(dependencies, args);
  }

  protected getPathEntries(): string[] {
    return [this.dependencies.directoryForBinaries];
  }

  protected get cwd(): string | undefined {
    return this.cluster.preferences?.terminalCWD;
  }

  public async open() {
    let env = await this.getCachedShellEnv();

    // extensions can modify the env
    env = this.dependencies.modifyTerminalShellEnv(this.cluster.id, env);

    const shell = env.PTYSHELL;

    if (!shell) {
      throw new Error("PTYSHELL is not defined with the environment");
    }

    const args = await this.getShellArgs(shell);

    await this.openShellProcess(shell, args, env);
  }

  protected async getShellArgs(shell: string): Promise<string[]> {
    const pathFromPreferences = this.dependencies.userStore.kubectlBinariesPath || this.kubectl.getBundledPath();
    const kubectlPathDir = this.dependencies.userStore.downloadKubectlBinaries ? await this.kubectlBinDirP : path.dirname(pathFromPreferences);

    switch(path.basename(shell)) {
      case "powershell.exe":
        return ["-NoExit", "-command", `& {$Env:PATH="${kubectlPathDir};${this.dependencies.directoryForBinaries};$Env:PATH"}`];
      case "bash":
        return ["--init-file", path.join(await this.kubectlBinDirP, ".bash_set_path")];
      case "fish":
        return ["--login", "--init-command", `export PATH="${kubectlPathDir}:${this.dependencies.directoryForBinaries}:$PATH"; export KUBECONFIG="${await this.kubeconfigPathP}"`];
      case "zsh":
        return ["--login"];
      default:
        return [];
    }
  }
}

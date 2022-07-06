/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import path from "path";
import type { TerminalShellEnvModify } from "../shell-env-modifier/terminal-shell-env-modify.injectable";
import type { ShellSessionArgs, ShellSessionDependencies } from "../shell-session";
import { ShellSession } from "../shell-session";

export interface LocalShellSessionDependencies extends ShellSessionDependencies {
  terminalShellEnvModify: TerminalShellEnvModify;
  readonly baseBundeledBinariesDirectory: string;
  readonly kubectlBinariesPath: IComputedValue<string | undefined>;
  readonly downloadKubectlBinaries: IComputedValue<boolean>;
}

export class LocalShellSession extends ShellSession {
  ShellType = "shell";

  constructor(protected readonly dependencies: LocalShellSessionDependencies, args: ShellSessionArgs) {
    super(dependencies, args);
  }

  protected getPathEntries(): string[] {
    return [this.dependencies.baseBundeledBinariesDirectory];
  }

  protected get cwd(): string | undefined {
    return this.cluster.preferences?.terminalCWD;
  }

  public async open() {
    const cachedEnv = await this.getCachedShellEnv();
    const env = this.dependencies.terminalShellEnvModify(this.cluster.id, cachedEnv);
    const shell = env.PTYSHELL;

    if (!shell) {
      throw new Error("PTYSHELL is not defined with the environment");
    }

    const args = await this.getShellArgs(shell);

    await this.openShellProcess(shell, args, env);
  }

  protected async getShellArgs(shell: string): Promise<string[]> {
    const pathFromPreferences = this.dependencies.kubectlBinariesPath.get() || this.kubectl.getBundledPath();
    const kubectlPathDir = this.dependencies.downloadKubectlBinaries.get() ? await this.kubectlBinDirP : path.dirname(pathFromPreferences);

    switch(path.basename(shell)) {
      case "powershell.exe":
        return ["-NoExit", "-command", `& {$Env:PATH="${kubectlPathDir};${this.dependencies.baseBundeledBinariesDirectory};$Env:PATH"}`];
      case "bash":
        return ["--init-file", path.join(await this.kubectlBinDirP, ".bash_set_path")];
      case "fish":
        return ["--login", "--init-command", `export PATH="${kubectlPathDir}:${this.dependencies.baseBundeledBinariesDirectory}:$PATH"; export KUBECONFIG="${await this.kubeconfigPathP}"`];
      case "zsh":
        return ["--login"];
      default:
        return [];
    }
  }
}

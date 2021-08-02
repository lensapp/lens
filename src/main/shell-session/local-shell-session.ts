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

import path from "path";
import { helmCli } from "../helm/helm-cli";
import { UserStore } from "../../common/user-store";
import { ShellSession } from "./shell-session";

export class LocalShellSession extends ShellSession {
  ShellType = "shell";

  protected getPathEntries(): string[] {
    return [helmCli.getBinaryDir()];
  }

  protected get cwd(): string | undefined {
    return this.cluster.preferences?.terminalCWD;
  }

  public async open() {
    const env = await this.getCachedShellEnv();
    const shell = env.PTYSHELL;
    const args = await this.getShellArgs(shell);

    super.open(env.PTYSHELL, args, env);
  }

  protected async getShellArgs(shell: string): Promise<string[]> {
    const helmpath = helmCli.getBinaryDir();
    const pathFromPreferences = UserStore.getInstance().kubectlBinariesPath || this.kubectl.getBundledPath();
    const kubectlPathDir = UserStore.getInstance().downloadKubectlBinaries ? await this.kubectlBinDirP : path.dirname(pathFromPreferences);

    switch(path.basename(shell)) {
      case "powershell.exe":
        return ["-NoExit", "-command", `& {Set-Location $Env:USERPROFILE; $Env:PATH="${helmpath};${kubectlPathDir};$Env:PATH"}`];
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

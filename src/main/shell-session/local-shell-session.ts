import * as pty from "node-pty";
import path from "path";
import { helmCli } from "../helm/helm-cli";
import { isWindows } from "../../common/vars";
import { appEventBus } from "../../common/event-bus";
import { userStore } from "../../common/user-store";
import { autobind } from "../../common/utils";
import { ShellSession } from "./shell-session";

type EnvVarMap = Record<string, string>;

export class LocalShellSession extends ShellSession {
  protected readonly EventName: string = "shell";

  protected kubectlBinDir: string;
  protected kubectlPathDir: string;
  protected helmBinDir: string;
  protected running = false;

  protected async rawOpen() {
    const env = await this.getCachedShellEnv();
    const shell = await this.getShell(env);
    const args = await this.getShellArgs(shell);
    const cwd = this.cwd(env);

    this.shellProcess = pty.spawn(shell, args, {
      cols: 80,
      cwd,
      env,
      name: "xterm-256color",
      rows: 30,
    });
    this.running = true;

    this.pipeStdout();
    this.pipeStdin();
    this.closeWebsocketOnProcessExit();
    this.exitProcessOnWebsocketClose();

    appEventBus.emit({ name: this.EventName, action: "open" });
  }

  public async open() {
    this.kubectlBinDir = await this.kubectl.binDir();
    const pathFromPreferences = userStore.preferences.kubectlBinariesPath || this.kubectl.getBundledPath();

    this.kubectlPathDir = userStore.preferences.downloadKubectlBinaries ? this.kubectlBinDir : path.dirname(pathFromPreferences);
    this.helmBinDir = helmCli.getBinaryDir();

    return this.rawOpen();
  }

  protected async getShell(env: EnvVarMap): Promise<string> {
    return env.PTYSHELL;
  }

  protected async getShellArgs(shell: string): Promise<string[]> {
    switch(path.basename(shell)) {
      case "powershell.exe":
        return ["-NoExit", "-command", `& {Set-Location $Env:USERPROFILE; $Env:PATH="${this.helmBinDir};${this.kubectlPathDir};$Env:PATH"}`];
      case "bash":
        return ["--init-file", path.join(this.kubectlBinDir, ".bash_set_path")];
      case "fish":
        return ["--login", "--init-command", `export PATH="${this.helmBinDir}:${this.kubectlPathDir}:$PATH"; export KUBECONFIG="${this.kubeconfigPath}"`];
      case "zsh":
        return ["--login"];
      default:
        return [];
    }
  }

  protected pipeStdout() {
    // send shell output to websocket
    this.shellProcess.onData(this.sendResponse);
  }

  protected pipeStdin() {
    // write websocket messages to shellProcess
    this.websocket.on("message", (data: string) => {
      if (!this.running) { return; }

      const message = Buffer.from(data.slice(1, data.length), "base64").toString();

      switch (data[0]) {
        case "0":
          this.shellProcess.write(message);
          break;
        case "4":
          const { Width, Height } = JSON.parse(message);

          this.shellProcess.resize(Width, Height);
          break;
        case "9":
          this.emit("newToken", message);
          break;
      }
    });
  }

  protected exit(code = 1000) {
    if (this.websocket.readyState == this.websocket.OPEN) this.websocket.close(code);
    this.emit("exit");
  }

  protected closeWebsocketOnProcessExit() {
    this.shellProcess.onExit(({ exitCode }) => {
      this.running = false;
      const timeout = exitCode > 0 ? 15 * 1000 : 0;

      if (exitCode > 0) {
        this.sendResponse("Terminal will auto-close in 15 seconds ...");
      }

      setTimeout(() => {
        this.exit();
      }, timeout);
    });
  }

  protected exitProcessOnWebsocketClose() {
    this.websocket.on("close", () => {
      this.killShellProcess();
    });
  }

  protected killShellProcess(){
    if (this.running) {
      // On Windows we need to kill the shell process by pid, since Lens won't respond after a while if using `this.shellProcess.kill()`
      if (isWindows) {
        try {
          process.kill(this.shellProcess.pid);
        } catch(e) {
          return;
        }
      } else {
        this.shellProcess.kill();
      }
    }
  }

  @autobind()
  protected sendResponse(msg: string) {
    this.websocket.send(`1${Buffer.from(msg).toString("base64")}`);
  }
}

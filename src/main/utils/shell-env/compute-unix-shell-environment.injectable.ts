/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { basename } from "path";
import type { EnvironmentVariables } from "./compute-shell-environment.injectable";
import { getInjectable } from "@ogre-tools/injectable";

interface UnixShellEnvOptions {
  signal?: AbortSignal;
}

export type ComputeUnixShellEnvironment = (shell: string, opts?: UnixShellEnvOptions) => Promise<EnvironmentVariables>;

const computeUnixShellEnvironmentInjectable = getInjectable({
  id: "compute-unix-shell-environment",
  instantiate: (): ComputeUnixShellEnvironment => async (shell, opts) => {
    const runAsNode = process.env["ELECTRON_RUN_AS_NODE"];
    const noAttach = process.env["ELECTRON_NO_ATTACH_CONSOLE"];
    const env = {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1",
      ELECTRON_NO_ATTACH_CONSOLE: "1",
    };
    const mark = randomUUID().replace(/-/g, "");
    const regex = new RegExp(`${mark}(.*)${mark}`);
    const shellName = basename(shell);
    let command: string;
    let shellArgs: string[];

    if (/^pwsh(-preview)?$/.test(shellName)) {
    // Older versions of PowerShell removes double quotes sometimes so we use "double single quotes" which is how
    // you escape single quotes inside of a single quoted string.
      command = `& '${process.execPath}' -p '''${mark}'' + JSON.stringify(process.env) + ''${mark}'''`;
      shellArgs = ["-Login", "-Command"];
    } else {
      command = `'${process.execPath}' -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`;

      if (shellName === "tcsh") {
        shellArgs = ["-ic"];
      } else {
        shellArgs = ["-ilc"];
      }
    }

    return new Promise((resolve, reject) => {
      const shellProcess = spawn(shell, [...shellArgs, command], {
        detached: true,
        stdio: ["ignore", "pipe", "pipe"],
        env,
      });
      const stdout: Buffer[] = [];

      opts?.signal?.addEventListener("abort", () => shellProcess.kill());

      shellProcess.on("error", (err) => reject(err));
      shellProcess.stdout.on("data", b => stdout.push(b));
      shellProcess.on("close", (code, signal) => {
        if (code || signal) {
          return reject(new Error(`Unexpected return code from spawned shell (code: ${code}, signal: ${signal})`));
        }

        try {
          const rawOutput = Buffer.concat(stdout).toString("utf-8");
          const match = regex.exec(rawOutput);
          const strippedRawOutput = match ? match[1] : "{}";
          const resolvedEnv = JSON.parse(strippedRawOutput);

          if (runAsNode) {
            resolvedEnv["ELECTRON_RUN_AS_NODE"] = runAsNode;
          } else {
            delete resolvedEnv["ELECTRON_RUN_AS_NODE"];
          }

          if (noAttach) {
            resolvedEnv["ELECTRON_NO_ATTACH_CONSOLE"] = noAttach;
          } else {
            delete resolvedEnv["ELECTRON_NO_ATTACH_CONSOLE"];
          }

          resolve(resolvedEnv);
        } catch(err) {
          reject(err);
        }
      });
    });
  },
  causesSideEffects: true,
});

export default computeUnixShellEnvironmentInjectable;

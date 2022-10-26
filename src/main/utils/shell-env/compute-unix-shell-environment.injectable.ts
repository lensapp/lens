/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { EnvironmentVariables } from "./compute-shell-environment.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import getBasenameOfPathInjectable from "../../../common/path/get-basename.injectable";
import spawnInjectable from "../../child-process/spawn.injectable";
import randomUUIDInjectable from "../../crypto/random-uuid.injectable";

export interface UnixShellEnvOptions {
  signal?: AbortSignal;
}

export type ComputeUnixShellEnvironment = (shell: string, opts?: UnixShellEnvOptions) => Promise<EnvironmentVariables>;

const computeUnixShellEnvironmentInjectable = getInjectable({
  id: "compute-unix-shell-environment",
  instantiate: (di): ComputeUnixShellEnvironment => {
    const powerShellName = /^pwsh(-preview)?$/;
    const nonBashLikeShellName = /^t?csh$/;

    const getBasenameOfPath = di.inject(getBasenameOfPathInjectable);
    const spawn = di.inject(spawnInjectable);
    const randomUUID = di.inject(randomUUIDInjectable);

    const getShellSpecifices = (shellPath: string, mark: string) => {
      const shellName = getBasenameOfPath(shellPath);

      if (powerShellName.test(shellName)) {
        // Older versions of PowerShell removes double quotes sometimes so we use "double single quotes" which is how
        // you escape single quotes inside of a single quoted string.
        return {
          command: `Command '${process.execPath}' -p '\\"${mark}\\" + JSON.stringify(process.env) + \\"${mark}\\"'`,
          shellArgs: ["-Login"],
        };
      }

      return {
        command: `'${process.execPath}' -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`,
        shellArgs: nonBashLikeShellName.test(shellName)
          // tcsh and csh don't support any other options when providing the -l (login) shell option
          ? ["-l"]
          // zsh (at least, maybe others) don't load RC files when in non-interactive mode, even when using -l (login) option
          : ["-li"],
      };
    };

    return async (shellPath, opts = {}) => {
      const runAsNode = process.env["ELECTRON_RUN_AS_NODE"];
      const noAttach = process.env["ELECTRON_NO_ATTACH_CONSOLE"];
      const env = {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        ELECTRON_NO_ATTACH_CONSOLE: "1",
      };
      const mark = randomUUID().replace(/-/g, "");
      const regex = new RegExp(`${mark}(\\{.*\\})${mark}`);
      const { command, shellArgs } = getShellSpecifices(shellPath, mark);

      return new Promise((resolve, reject) => {
        const shellProcess = spawn(shellPath, shellArgs, {
          detached: true,
          env,
        });
        const stdout: Buffer[] = [];

        opts.signal?.addEventListener("abort", () => shellProcess.kill());

        shellProcess.stdout.on("data", b => stdout.push(b));

        shellProcess.on("error", (err) => reject(err));
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
          } catch (err) {
            reject(err);
          }
        });
        shellProcess.stdin.end(command);
      });
    };
  },
  causesSideEffects: true,
});

export default computeUnixShellEnvironmentInjectable;

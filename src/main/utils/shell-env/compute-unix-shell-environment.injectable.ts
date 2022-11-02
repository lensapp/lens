/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { EnvironmentVariables } from "./compute-shell-environment.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import getBasenameOfPathInjectable from "../../../common/path/get-basename.injectable";
import spawnInjectable from "../../child-process/spawn.injectable";
import randomUUIDInjectable from "../../crypto/random-uuid.injectable";
import loggerInjectable from "../../../common/logger.injectable";

export interface UnixShellEnvOptions {
  signal: AbortSignal;
}

export type ComputeUnixShellEnvironment = (shell: string, opts: UnixShellEnvOptions) => Promise<EnvironmentVariables>;

const getResetProcessEnv = (src: Partial<Record<string, string>>, names: string[]): ((target: Partial<Record<string, string>>) => void) => {
  const pairs = names.map(name => ([name, src[name]] as const));

  return (target) => {
    for (const [name, orginalValue] of pairs) {
      if (orginalValue) {
        target[name] = orginalValue;
      } else {
        delete target[name];
      }
    }
  };
};

const computeUnixShellEnvironmentInjectable = getInjectable({
  id: "compute-unix-shell-environment",
  instantiate: (di): ComputeUnixShellEnvironment => {
    const powerShellName = /^pwsh(-preview)?$/;
    const cshLikeShellName = /^(t?csh)$/;
    const fishLikeShellName = /^fish$/;

    const getBasenameOfPath = di.inject(getBasenameOfPathInjectable);
    const spawn = di.inject(spawnInjectable);
    const logger = di.inject(loggerInjectable);
    const randomUUID = di.inject(randomUUIDInjectable);

    const getShellSpecifices = (shellName: string, mark: string) => {
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
        shellArgs: cshLikeShellName.test(shellName) || fishLikeShellName.test(shellName)
          // Some shells don't support any other options when providing the -l (login) shell option
          ? ["-l"]
          // zsh (at least, maybe others) don't load RC files when in non-interactive mode, even when using -l (login) option
          : ["-li"],
      };
    };


    return async (shellPath, opts) => {
      const resetEnvPairs = getResetProcessEnv(process.env, [
        "ELECTRON_RUN_AS_NODE",
        "ELECTRON_NO_ATTACH_CONSOLE",
        "TERM",
      ]);
      const env = {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        ELECTRON_NO_ATTACH_CONSOLE: "1",
        TERM: "screen-256color-bce", // required for fish
      };
      const mark = randomUUID().replace(/-/g, "");
      const regex = new RegExp(`${mark}(\\{.*\\})${mark}`);
      const { command, shellArgs } = getShellSpecifices(shellPath, mark);

      logger.info(`[UNIX-SHELL-ENV]: running against ${shellPath}`, { command, shellArgs });

      return new Promise((resolve, reject) => {
        const shellName = getBasenameOfPath(shellPath);
        const isFishShellLike = fishLikeShellName.test(shellName);

        if (isFishShellLike) {
          shellArgs.push("-c", command);
        }

        const shellProcess = spawn(shellPath, shellArgs, {
          signal: opts.signal,
          env,
        });
        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];

        shellProcess.stdout.on("data", b => stdout.push(b));
        shellProcess.stderr.on("data", b => stderr.push(b));

        shellProcess.on("error", (err) => reject(err));
        shellProcess.on("close", (code, signal) => {
          if (code || signal) {
            return reject(Object.assign(new Error(`Unexpected return code from spawned shell (code: ${code}, signal: ${signal})`), {
              stderr: Buffer.concat(stderr).toString("utf-8"),
            }));
          }

          try {
            const rawOutput = Buffer.concat(stdout).toString("utf-8");

            logger.info(`[UNIX-SHELL-ENV]: got the following output`, { rawOutput });

            const match = regex.exec(rawOutput);
            const strippedRawOutput = match ? match[1] : "{}";
            const resolvedEnv = JSON.parse(strippedRawOutput);

            resetEnvPairs(resolvedEnv);
            resolve(resolvedEnv);
          } catch (err) {
            reject(err);
          }
        });

        if (isFishShellLike) {
          shellProcess.stdin.end();
        } else {
          shellProcess.stdin.end(command);
        }
      });
    };
  },
  causesSideEffects: true,
});

export default computeUnixShellEnvironmentInjectable;

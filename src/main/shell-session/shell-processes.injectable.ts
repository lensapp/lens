/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IPty } from "node-pty";
import loggerInjectable from "../../common/logger.injectable";
import { getOrInsertWith } from "../../common/utils";
import type { AsyncResult } from "../../common/utils/async-result";
import spawnPtyInjectable from "./spawn-pty.injectable";

export interface StartOrResuemArgs {
  terminalId: string;
  shell: string;
  args: string[];
  env: Partial<Record<string, string>>;
  cwd: string;
}

export interface ShellProcesses {
  startOrResume: (args: StartOrResuemArgs) => AsyncResult<{ shellProcess: IPty; resume: boolean }>;
  cleanup: () => void;
  clear: (terminalId: string) => void;
}

const shellProcessesInjectable = getInjectable({
  id: "shell-processes",
  instantiate: (di): ShellProcesses => {
    const spawnPty = di.inject(spawnPtyInjectable);
    const logger = di.inject(loggerInjectable);

    const processes = new Map<string, IPty>();

    return {
      startOrResume: ({ terminalId, shell, args, env, cwd }) => {
        try {
          const resume = processes.has(terminalId);

          const shellProcess = getOrInsertWith(processes, terminalId, () => (
            spawnPty(shell, args, {
              rows: 30,
              cols: 80,
              cwd,
              env,
              name: "xterm-256color",
              // TODO: Something else is broken here so we need to force the use of winPty on windows
              useConpty: false,
            })
          ));

          logger.info(`[SHELL-SESSION]: PTY for ${terminalId} is ${resume ? "resumed" : "started"} with PID=${shellProcess.pid}`);

          return {
            callWasSuccessful: true,
            response: { shellProcess, resume },
          };
        } catch (error) {
          logger.warn(`[SHELL-SESSION]: Failed to start PTY for ${terminalId}: ${error}`, { shell });

          return {
            callWasSuccessful: false,
            error: String(error),
          };
        }
      },
      cleanup: () => {
        for (const shellProcess of processes.values()) {
          try {
            process.kill(shellProcess.pid);
          } catch {
            // ignore error
          }
        }

        processes.clear();
      },
      clear: (terminalId) => {
        processes.delete(terminalId);
      },
    };
  },
});

export default shellProcessesInjectable;

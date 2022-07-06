/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IPty } from "node-pty";
import loggerInjectable from "../../common/logger.injectable";
import { getOrInsertWith } from "../../renderer/utils";
import shellProcessesInjectable from "./shell-processes.injectable";
import spawnPtyInjectable from "./spawn-pty.injectable";

export interface EnsuredShellProcess {
  shellProcess: IPty;
  resume: boolean;
  cleanup: () => void;
}
export interface EnsureShellProcessArgs {
  shell: string;
  args: string[];
  env: Record<string, string | undefined>;
  cwd: string;
  terminalId: string;
}
export type EnsureShellProcess = (args: EnsureShellProcessArgs) => EnsuredShellProcess;

const ensureShellProcessInjectable = getInjectable({
  id: "ensure-shell-process",
  instantiate: (di): EnsureShellProcess => {
    const shellProcesses = di.inject(shellProcessesInjectable);
    const logger = di.inject(loggerInjectable);
    const spawnPty = di.inject(spawnPtyInjectable);

    return ({ shell, args, env, cwd, terminalId } ) => {
      const resume = shellProcesses.has(terminalId);
      const shellProcess = getOrInsertWith(shellProcesses, terminalId, () => (
        spawnPty(shell, args, {
          rows: 30,
          cols: 80,
          cwd,
          env: env as Record<string, string>,
          name: "xterm-256color",
          // TODO: Something else is broken here so we need to force the use of winPty on windows
          useConpty: false,
        })
      ));

      logger.info(`[SHELL-SESSION]: PTY for ${terminalId} is ${resume ? "resumed" : "started"} with PID=${shellProcess.pid}`);

      return {
        shellProcess,
        resume,
        cleanup: () => {
          shellProcess.kill();
          shellProcesses.delete(terminalId);
        },
      };
    };
  },
});

export default ensureShellProcessInjectable;

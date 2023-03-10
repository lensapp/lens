/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AsyncResult } from "@k8slens/utilities";
import nonPromiseExecFileInjectable from "./non-promise-exec-file.injectable";
import { isNumber } from "@k8slens/utilities";
import assert from "assert";
import type { ChildProcess } from "child_process";

export type ExecFileWithInput = (options: {
  filePath: string;
  commandArguments: string[];
  input: string;
}) => AsyncResult<string, unknown>;

const execFileWithInputInjectable = getInjectable({
  id: "exec-file-with-input",

  instantiate: (di): ExecFileWithInput => {
    const execFile = di.inject(nonPromiseExecFileInjectable);

    return async ({ filePath, commandArguments, input }) =>
      new Promise((resolve) => {
        let execution: ChildProcess;

        try {
          execution = execFile(filePath, commandArguments, {
            maxBuffer: 8 * 1024 * 1024 * 1024, // 8 MiB
          });
        } catch (e) {
          resolve({ callWasSuccessful: false, error: e });

          return;
        }

        assert(execution.stdout, "stdout is not defined");
        assert(execution.stderr, "stderr is not defined");
        assert(execution.stdin, "stdin is not defined");

        let stdout = "";
        let stderr = "";

        execution.stdout.on("data", (data) => {
          stdout += data;
        });

        execution.stderr.on("data", (data) => {
          stderr += data;
        });

        execution.on("error", (error) =>
          resolve({ callWasSuccessful: false, error }),
        );

        execution.on("exit", (code, signal) => {
          if (!isNumber(code)) {
            /**
             * According to https://nodejs.org/api/child_process.html#class-childprocess (section about the "exit" event)
             * it says the following:
             *
             * If the process exited, code is the final exit code of the process, otherwise null.
             * If the process terminated due to receipt of a signal, signal is the string name of the signal, otherwise null.
             * One of the two will always be non-null.
             */
            resolve({
              callWasSuccessful: false,
              error: `Exited via ${signal}`,
            });

            return;
          }

          if (code !== 0) {
            resolve({
              callWasSuccessful: false,
              error: stderr ? stderr : `Failed with error: ${signal}`,
            });

            return;
          }

          resolve({ callWasSuccessful: true, response: stdout });
        });

        execution.stdin.end(input);
      });
  },
});

export default execFileWithInputInjectable;

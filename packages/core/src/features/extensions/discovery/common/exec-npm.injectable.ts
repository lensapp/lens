/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { fork } from "child_process";
import directoryForUserDataInjectable from "../../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";
import pathToNpmCliInjectable from "../../../../common/app-paths/path-to-npm-cli.injectable";
import type { AsyncResult } from "../../../../common/utils/async-result";

export type ExecNpm = (...args: string[]) => Promise<AsyncResult<void, Error>>;

const execNpmInjectable = getInjectable({
  id: "exec-npm",
  instantiate: (di): ExecNpm => {
    const pathToNpmCli = di.inject(pathToNpmCliInjectable);
    const directoryForUserData = di.inject(directoryForUserDataInjectable);

    return (...args) => new Promise((resolve) => {
      const child = fork(pathToNpmCli, args, {
        cwd: directoryForUserData,
        silent: true,
        env: {},
      });
      let stderr = "";

      child.stderr?.on("data", data => {
        stderr += String(data);
      });

      child.on("close", (code) => {
        if (code !== 0) {
          resolve({
            callWasSuccessful: false,
            error: new Error(stderr),
          });
        } else {
          resolve({
            callWasSuccessful: true,
          });
        }
      });

      child.on("error", error => {
        resolve({
          callWasSuccessful: false,
          error,
        });
      });
    });
  },
  causesSideEffects: true,
});

export default execNpmInjectable;

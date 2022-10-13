/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execFileInjectable from "../../../common/fs/exec-file.injectable";
import helmBinaryPathInjectable from "../helm-binary-path.injectable";
import type { AsyncResult } from "../../../common/utils/async-result";

export type ExecHelm = (args: string[]) => Promise<AsyncResult<string, string>>;

const execHelmInjectable = getInjectable({
  id: "exec-helm",

  instantiate: (di): ExecHelm => {
    const execFile = di.inject(execFileInjectable);
    const helmBinaryPath = di.inject(helmBinaryPathInjectable);

    return async (args) => {
      const response = await execFile(helmBinaryPath, args, {
        maxBuffer: 32 * 1024 * 1024 * 1024, // 32 MiB
      });

      if (response.callWasSuccessful) {
        return response;
      }

      return {
        callWasSuccessful: false,
        error: response.error.stderr || response.error.error.message,
      };
    };
  },
});


export default execHelmInjectable;

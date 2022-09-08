/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import execFileInjectable from "../../../common/fs/exec-file.injectable";
import helmBinaryPathInjectable from "../helm-binary-path.injectable";
import type { AsyncResult } from "../../../common/utils/async-result";
import { getErrorMessage } from "../../../common/utils/get-error-message";

export type ExecHelm = (args: string[]) => Promise<AsyncResult<string>>;

const execHelmInjectable = getInjectable({
  id: "exec-helm",

  instantiate: (di): ExecHelm => {
    const execFile = di.inject(execFileInjectable);
    const helmBinaryPath = di.inject(helmBinaryPathInjectable);

    return async (args) => {
      try {
        const response = await execFile(helmBinaryPath, args, {
          maxBuffer: 32 * 1024 * 1024 * 1024, // 32 MiB
        });

        return { callWasSuccessful: true, response };
      } catch (error) {
        return { callWasSuccessful: false, error: getErrorMessage(error) };
      }
    };
  },
});


export default execHelmInjectable;

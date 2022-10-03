/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ExecFileOptions } from "child_process";
import { execFile } from "child_process";
import { promisify } from "util";

export type ExecFile = (filePath: string, args: string[], options: ExecFileOptions) => Promise<string>;

const execFileInjectable = getInjectable({
  id: "exec-file",

  instantiate: (): ExecFile => {
    const asyncExecFile = promisify(execFile);

    return async (filePath, args, options) => {
      const result = await asyncExecFile(filePath, args, options);

      return result.stdout;
    };
  },

  causesSideEffects: true,
});

export default execFileInjectable;

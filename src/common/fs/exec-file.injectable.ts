/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { execFile } from "child_process";
import { promisify } from "util";

export type ExecFile = (filePath: string, args: string[]) => Promise<string>;

const execFileInjectable = getInjectable({
  id: "exec-file",

  instantiate: (): ExecFile => async (filePath, args) => {
    const asyncExecFile = promisify(execFile);

    const result = await asyncExecFile(filePath, args);

    return result.stdout;
  },

  causesSideEffects: true,
});

export default execFileInjectable;

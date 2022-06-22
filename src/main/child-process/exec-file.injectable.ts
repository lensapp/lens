/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ExecFileOptions, ExecFileOptionsWithStringEncoding } from "child_process";
import { execFile } from "child_process";
import { promisify } from "util";

export interface ExecFile {
  (file: string, args?: readonly string[], opts?: ExecFileOptionsWithStringEncoding | ExecFileOptions): Promise<string>;
}

const execFileInjectable = getInjectable({
  id: "exec-file",
  instantiate: (): ExecFile => {
    const asyncExecFile = promisify(execFile);

    return async (file) => {
      const { stdout } = await asyncExecFile(file);

      return stdout;
    };
  },
});

export default execFileInjectable;

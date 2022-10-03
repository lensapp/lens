/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ExecFileOptions } from "child_process";
import { execFile } from "child_process";
import { promisify } from "util";

export interface ExecFile {
  (filePath: string): Promise<string>;
  (filePath: string, argsOrOptions: string[] | ExecFileOptions): Promise<string>;
  (filePath: string, args: string[], options: ExecFileOptions): Promise<string>;
}

const execFileInjectable = getInjectable({
  id: "exec-file",

  instantiate: (): ExecFile => {
    const asyncExecFile = promisify(execFile);

    return async (filePath: string, argsOrOptions?: string[] | ExecFileOptions, maybeOptions?: ExecFileOptions) => {
      let args: string[];
      let options: ExecFileOptions;

      if (Array.isArray(argsOrOptions)) {
        args = argsOrOptions;
        options = maybeOptions ?? {};
      } else {
        args = [];
        options = maybeOptions ?? argsOrOptions ?? {};
      }

      const result = await asyncExecFile(filePath, args, {
        encoding: "utf-8",
        ...options,
      });

      return result.stdout;
    };
  },

  causesSideEffects: true,
});

export default execFileInjectable;

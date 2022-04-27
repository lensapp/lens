/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { promiseExecFile } from "../../common/utils/promise-exec";
import type { BaseEncodingOptions } from "fs";
import type { ExecFileOptions } from "child_process";
import { helmBinaryPath } from "../../common/vars";
import { UserStore } from "../../common/user-store";

/**
 * ExecFile the bundled helm CLI
 * @returns STDOUT
 */
export async function execHelm(args: string[], options?: BaseEncodingOptions & ExecFileOptions): Promise<string> {
  try {
    const opts = { ...options };

    opts.env ??= process.env;

    if (!opts.env.HTTPS_PROXY && UserStore.getInstance().httpsProxy) {
      opts.env.HTTPS_PROXY = UserStore.getInstance().httpsProxy;
    }

    const { stdout } = await promiseExecFile(helmBinaryPath.get(), args, opts);

    return stdout;
  } catch (error) {
    throw error?.stderr || error;
  }
}

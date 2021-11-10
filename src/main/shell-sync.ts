/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { shellEnv } from "./utils/shell-env";
import os from "os";
import { app } from "electron";
import logger from "../common/logger";
import { isSnap } from "../common/vars";

/**
 * shellSync loads what would have been the environment if this application was
 * run from the command line, into the process.env object. This is especially
 * useful on macos where this always needs to be done.
 */
export async function shellSync() {
  const env = await shellEnv(os.userInfo().shell);

  if (!env.LANG) {
    // the LANG env var expects an underscore instead of electron's dash
    env.LANG = `${app.getLocale().replace("-", "_")}.UTF-8`;
  } else if (!env.LANG.endsWith(".UTF-8")) {
    env.LANG += ".UTF-8";
  }

  if (!isSnap) {
    process.env.PATH = env.PATH;
  }

  // The spread operator allows joining of objects. The precedence is last to first.
  process.env = {
    ...env,
    ...process.env,
  };

  logger.debug(`[SHELL-SYNC]: Synced shell env, and updating`, env, process.env);
}

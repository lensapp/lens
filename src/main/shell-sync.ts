/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { shellEnv } from "./utils/shell-env";
import os from "os";
import { app } from "electron";
import logger from "./logger";
import { isSnap } from "../common/vars";
import { unionPATHs } from "../common/utils/union-env-path";

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
    // Prefer the synced PATH over the initial one
    process.env.PATH = unionPATHs(env.PATH ?? "",  process.env.PATH ?? "");
  }

  // The spread operator allows joining of objects. The precedence is last to first.
  process.env = {
    ...env,
    ...process.env,
  };

  logger.debug(`[SHELL-SYNC]: Synced shell env, and updating`, env, process.env);
}

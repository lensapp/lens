/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import shellEnvironment from "shell-env";
import logger from "../logger";

export type EnvironmentVariables = Partial<Record<string, string>>;

let shellSyncFailed = false;

/**
 * Attempts to get the shell environment per the user's existing startup scripts.
 * If the environment can't be retrieved after 5 seconds an error message is logged.
 * Subsequent calls after such a timeout simply log an error message without trying
 * to get the environment, unless forceRetry is true.
 * @param shell the shell to get the environment from
 * @param forceRetry if true will always try to get the environment, otherwise if
 * a previous call to this function failed then this call will fail too.
 * @returns object containing the shell's environment variables. An empty object is
 * returned if the call fails.
 */
export async function shellEnv(shell?: string, forceRetry = false) : Promise<EnvironmentVariables> {
  if (forceRetry) {
    shellSyncFailed = false;
  }

  if (!shellSyncFailed) {
    try {
      return await Promise.race([
        shellEnvironment(shell),
        new Promise<EnvironmentVariables>((_resolve, reject) => setTimeout(() => {
          reject(new Error("Resolving shell environment is taking very long. Please review your shell configuration."));
        }, 30_000)),
      ]);
    } catch (error) {
      logger.error(`shellEnv: ${error}`);
      shellSyncFailed = true;
    }
  } else {
    logger.error("shellSync(): Resolving shell environment took too long. Please review your shell configuration.");
  }

  return {};
}

import shellEnv from "shell-env";
import os from "os";
import { app } from "electron";
import logger from "./logger";

interface Env {
  [key: string]: string;
}

/**
 * shellSync loads what would have been the environment if this application was
 * run from the command line, into the process.env object. This is especially
 * useful on macos where this always needs to be done.
 */
export async function shellSync() {
  const { shell } = os.userInfo();
  let envVars = {};

  try {
    envVars = await shellEnv(shell);
  } catch (error) {
    logger.error(`shellEnv: ${error}`);
  }

  const env: Env = JSON.parse(JSON.stringify(envVars));

  if (!env.LANG) {
    // the LANG env var expects an underscore instead of electron's dash
    env.LANG = `${app.getLocale().replace("-", "_")}.UTF-8`;
  } else if (!env.LANG.endsWith(".UTF-8")) {
    env.LANG += ".UTF-8";
  }

  // Overwrite PATH on darwin
  if (process.env.NODE_ENV === "production" && process.platform === "darwin") {
    process.env["PATH"] = env.PATH;
  }

  // The spread operator allows joining of objects. The precedence is last to first.
  process.env = {
    ...env,
    ...process.env,
  };
}

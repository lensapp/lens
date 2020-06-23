import shellEnv = require("shell-env")
import logger from "./logger"
import * as os from "os";

interface Env {
  [key: string]: string;
}

/**
 * shellSync loads what would have been the environment if this application was
 * run from the command line, into the process.env object. This is especially
 * useful on macos where this always needs to be done.
 * @param locale Should be electron's `app.getLocale()`
 */
export function shellSync(locale: string) {
  const { shell } = os.userInfo();
  const env: Env = JSON.parse(JSON.stringify(shellEnv.sync(shell)))
  if (!env.LANG) {
    // the LANG env var expects an underscore instead of electron's dash
    env.LANG = `${locale.replace('-', '_')}.UTF-8`;
  } else if (!env.LANG.endsWith(".UTF-8")) {
    env.LANG += ".UTF-8"
  }

  // Overwrite PATH on darwin
  if (process.env.NODE_ENV === "production" && process.platform === "darwin") {
    process.env["PATH"] = env.PATH
  }

  // The spread operator allows joining of objects. The precedence is last to first.
  process.env = {
    ...env,
    ...process.env,
  };
}

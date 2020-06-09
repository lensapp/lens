import shellEnv from "shell-env"
import logger from "./logger"
import { isMac, isProduction } from "../common/vars";

export async function shellSync() {
  const env = await shellEnv()

  // Overwrite PATH on darwin
  if (isProduction && isMac) {
    process.env["PATH"] = env.PATH
  }

  let key = null
  for (key in env) {
    if (!env.hasOwnProperty(key) || process.env[key]) continue // skip existing and prototype keys
    logger.debug("Imported " + key + " from login shell to process environment")
    process.env[key] = env[key]
  }
}

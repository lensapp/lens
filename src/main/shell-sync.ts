import shellEnv = require("shell-env")
import logger from "./logger"

export async function shellSync() {
  const env = await shellEnv()

  // Overwrite PATH on darwin
  if (process.env.NODE_ENV === "production" && process.platform === "darwin") {
    process.env["PATH"] = env.PATH
  }

  let key = null
  for(key in env) {
    if(!env.hasOwnProperty(key) || process.env[key]) continue // skip existing and prototype keys
    logger.debug("Imported " + key + " from login shell to process environment")
    process.env[key] = env[key]
  }
}

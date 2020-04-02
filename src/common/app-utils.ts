import { app, remote } from "electron"

/**
 *
 * @returns app version correctly regardless of dev/prod mode and main/renderer differences
 */
export function getAppVersion(): string {
  // app is undefined when running in renderer
  let version = (app || remote.app).getVersion()
  if(process.env.NODE_ENV === 'development') {
    version = require("../../package.json").version
  }
  return version;
}

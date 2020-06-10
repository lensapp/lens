import packageInfo from "../../../package.json"
import { app, remote } from "electron"

/**
 * @returns app version correctly regardless of dev/prod mode and main/renderer differences
 */
export function getAppVersion(): string {
  const version = (app || remote.app).getVersion();
  return version || packageInfo.version;
}

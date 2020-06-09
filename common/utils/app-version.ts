import { app, remote } from "electron"

/**
 *
 * @returns app version correctly regardless of dev/prod mode and main/renderer differences
 */
export function getAppVersion(): string {
  return (app || remote.app).getVersion();
}

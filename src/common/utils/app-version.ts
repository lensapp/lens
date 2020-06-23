import packageInfo from "../../../package.json"

export function getAppVersion(): string {
  return packageInfo.version;
}

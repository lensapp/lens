import packageInfo from "../../../package.json"

export function getAppVersion(): string {
  return packageInfo.version;
}

export function getBundledKubectlVersion(): string {
  return packageInfo.config.bundledKubectlVersion;
}

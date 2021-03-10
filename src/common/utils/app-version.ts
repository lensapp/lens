import got from "got/dist/source";
import packageInfo from "../../../package.json";

export function getAppVersion(): string {
  return packageInfo.version;
}

export function getBundledKubectlVersion(): string {
  return packageInfo.config.bundledKubectlVersion;
}

export function getBundledExtensions(): string[] {
  return packageInfo.lens?.extensions || [];
}

export async function getAppVersionFromProxyServer(proxyPort: number): Promise<string> {
  const responseJson = await got(`http://localhost:${proxyPort}/version`).json<any>();

  return responseJson.version;
}

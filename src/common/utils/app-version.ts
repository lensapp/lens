import requestPromise from "request-promise-native";
import packageInfo from "../../../package.json";

export function getAppVersion(): string {
  return packageInfo.version;
}

export function getBundledKubectlVersion(): string {
  return packageInfo.config.bundledKubectlVersion;
}

export async function getAppVersionFromProxyServer(proxyPort: number): Promise<string> {
  const response = await requestPromise({
    method: "GET",
    uri: `http://localhost:${proxyPort}/version`,
    resolveWithFullResponse: true
  });

  return JSON.parse(response.body).version;
}

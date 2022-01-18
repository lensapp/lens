/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

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
    uri: `http://127.0.0.1:${proxyPort}/version`,
    resolveWithFullResponse: true,
    proxy: undefined,
  });

  return JSON.parse(response.body).version;
}

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import got from "got";
import packageInfo from "../../../package.json";

export function getAppVersion(): string {
  return packageInfo.version;
}

export function getBundledKubectlVersion(): string {
  return packageInfo.config.bundledKubectlVersion;
}

interface AppVersion {
  version: string;
}

export async function getAppVersionFromProxyServer(proxyPort: number): Promise<string> {
  const { body } = await got<AppVersion>(`http://localhost:${proxyPort}/version`, {
    responseType: "json",
  });

  return body.version;
}

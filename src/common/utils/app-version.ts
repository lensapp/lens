/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import requestPromise from "request-promise-native";

export async function getAppVersionFromProxyServer(proxyPort: number): Promise<string> {
  const response = await requestPromise({
    method: "GET",
    uri: `http://127.0.0.1:${proxyPort}/version`,
    resolveWithFullResponse: true,
    proxy: undefined,
  });

  return JSON.parse(response.body).version;
}

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { JsonApi } from "./json-api";
import { KubeJsonApi } from "./kube-json-api";
import { apiKubePrefix, apiPrefix, isDebugging, isDevelopment } from "../../common/vars";
import { isClusterPageContext } from "../utils/cluster-id-url-parsing";
import { appEventBus } from "../app-event-bus/event-bus";

let apiBase: JsonApi;
let apiKube: KubeJsonApi;

if (typeof window === "undefined") {
  appEventBus.addListener((event) => {
    if (event.name !== "lens-proxy" && event.action !== "listen") return;

    const params = event.params as { port?: number };

    if (!params.port) return;

    apiBase = new JsonApi({
      serverAddress: `http://127.0.0.1:${params.port}`,
      apiBase: apiPrefix,
      debug: isDevelopment || isDebugging,
    }, {
      headers: {
        "Host": `localhost:${params.port}`,
      },
    });
  });
} else {
  apiBase = new JsonApi({
    serverAddress: `http://127.0.0.1:${window.location.port}`,
    apiBase: apiPrefix,
    debug: isDevelopment || isDebugging,
  }, {
    headers: {
      "Host": window.location.host,
    },
  });
}

if (isClusterPageContext()) {
  apiKube = new KubeJsonApi({
    serverAddress: `http://127.0.0.1:${window.location.port}`,
    apiBase: apiKubePrefix,
    debug: isDevelopment,
  }, {
    headers: {
      "Host": window.location.host,
    },
  });
}

export {
  apiBase,
  apiKube,
};

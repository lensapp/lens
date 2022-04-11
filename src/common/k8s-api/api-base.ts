/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { JsonApi } from "./json-api";
import { apiPrefix, isDebugging, isDevelopment } from "../vars";
import type { AppEvent, LensProxyEvent } from "../app-event-bus/event-bus";
import { appEventBus } from "../app-event-bus/event-bus";

export let apiBase: JsonApi;

const isProxyEvent = (event: AppEvent): event is LensProxyEvent => {
  return event.type === "LENS_PROXY_EVENT";
};

if (typeof window === "undefined") {
  appEventBus.addListener((event) => {
    if (isProxyEvent(event)) {
      if(event.name !== "lens-proxy" && event.action !== "listen") {
        return;
      }

      if (!event.params.port) {
        return;
      }

      apiBase = new JsonApi({
        serverAddress: `http://127.0.0.1:${event.params.port}`,
        apiBase: apiPrefix,
        debug: isDevelopment || isDebugging,
      }, {
        headers: {
          "Host": `localhost:${event.params.port}`,
        },
      });
    }
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

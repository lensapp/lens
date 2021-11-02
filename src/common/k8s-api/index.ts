/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { JsonApi } from "./json-api";
import { KubeJsonApi } from "./kube-json-api";
import { apiKubePrefix, apiPrefix, isDebugging, isDevelopment } from "../../common/vars";
import { isClusterPageContext } from "../utils/cluster-id-url-parsing";
import { appEventBus } from "../event-bus";

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

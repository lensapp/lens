/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { apiBaseInjectionToken } from "../../common/k8s-api/api-base";
import { JsonApi } from "../../common/k8s-api/json-api";
import { apiPrefix } from "../../common/vars";
import isDebuggingInjectable from "../../common/vars/is-debugging.injectable";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import lensProxyPortInjectable from "../lens-proxy/lens-proxy-port.injectable";

const apiBaseInjectable = getInjectable({
  id: "api-base",
  instantiate: (di) => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const isDebugging= di.inject(isDebuggingInjectable);
    const proxyPort = lensProxyPort.get();

    return new JsonApi({
      serverAddress: `http://127.0.0.1:${proxyPort}`,
      apiBase: apiPrefix,
      debug: isDevelopment || isDebugging,
    }, {
      headers: {
        "Host": `localhost:${proxyPort}`,
      },
    });
  },
  injectionToken: apiBaseInjectionToken,
});

export default apiBaseInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiBaseInjectionToken } from "../../common/k8s-api/api-base";
import { JsonApi } from "../../common/k8s-api/json-api";
import { apiPrefix, isDebugging } from "../../common/vars";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import lensProxyPortInjectable from "../lens-proxy/lens-proxy-port.injectable";

const apiBaseInjectable = getInjectable({
  id: "api-base",
  instantiate: (di) => {
    const proxyPort = di.inject(lensProxyPortInjectable);

    return new JsonApi({
      serverAddress: `http://127.0.0.1:${proxyPort.get()}`,
      apiBase: apiPrefix,
      debug: di.inject(isDevelopmentInjectable) || isDebugging,
    }, {
      headers: {
        "Host": `localhost:${proxyPort.get()}`,
      },
    });
  },
  injectionToken: apiBaseInjectionToken,
});

export default apiBaseInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiPrefix } from "../vars";
import isDebuggingInjectable from "../vars/is-debugging.injectable";
import isDevelopmentInjectable from "../vars/is-development.injectable";
import { apiBaseHostHeaderInjectionToken, apiBaseServerAddressInjectionToken } from "./api-base-configs";
import createJsonApiInjectable from "./create-json-api.injectable";

const apiBaseInjectable = getInjectable({
  id: "api-base",
  instantiate: (di) => {
    const createJsonApi = di.inject(createJsonApiInjectable);
    const isDebugging = di.inject(isDebuggingInjectable);
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const serverAddress = di.inject(apiBaseServerAddressInjectionToken);
    const hostHeaderValue = di.inject(apiBaseHostHeaderInjectionToken);

    return createJsonApi({
      serverAddress,
      apiBase: apiPrefix,
      debug: isDevelopment || isDebugging,
    }, {
      headers: {
        "Host": hostHeaderValue,
      },
    });
  },
});

export default apiBaseInjectable;

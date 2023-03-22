/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensFetchInjectable from "../fetch/lens-fetch.injectable";
import loggerInjectable from "../logger.injectable";
import { apiPrefix } from "../vars";
import { apiBaseHostHeaderInjectionToken, apiBaseServerAddressInjectionToken } from "./api-base-configs";
import isApiBaseInDebugModeInjectable from "./is-api-in-debug-mode.injectable";
import { JsonApi } from "./json-api";

const apiBaseInjectable = getInjectable({
  id: "api-base",
  instantiate: (di) => new JsonApi({
    fetch: di.inject(lensFetchInjectable),
    logger: di.inject(loggerInjectable),
  }, {
    serverAddress: di.inject(apiBaseServerAddressInjectionToken),
    apiBase: apiPrefix,
    debug: di.inject(isApiBaseInDebugModeInjectable),
  }, {
    headers: {
      "Host": di.inject(apiBaseHostHeaderInjectionToken),
    },
  }),
});

export default apiBaseInjectable;

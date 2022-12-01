/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensAuthenticationHeaderValueInjectionToken } from "../auth/header-value";
import { lensAuthenticationHeader } from "../vars/auth-header";
import fetchModuleInjectable from "./fetch-module.injectable";
import type { Fetch } from "./fetch.injectable";
import fetchInjectable from "./fetch.injectable";

/**
 * This injectable should not be used to request data from external sources as it would leak the
 * authentication header value
 */
const lensAuthenticatedFetchInjectable = getInjectable({
  id: "lens-authenticated-fetch",
  instantiate: (di): Fetch => {
    const authHeaderValue = di.inject(lensAuthenticationHeaderValueInjectionToken);
    const fetch = di.inject(fetchInjectable);
    const { Headers } = di.inject(fetchModuleInjectable);

    return async (url, init) => {
      const {
        headers: headersInit,
        ...rest
      } = init ?? {};
      const headers = new Headers(headersInit);

      headers.set(lensAuthenticationHeader, authHeaderValue);

      return fetch(url, {
        headers,
        ...rest,
      });
    };
  },
});

export default lensAuthenticatedFetchInjectable;

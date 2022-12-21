/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestInit, Response } from "node-fetch";
import lensAuthenticatedAgentInjectable from "../../features/lens-proxy/common/lens-auth-agent.injectable";
import { lensAuthenticationHeaderValueInjectionToken } from "../auth/header-value";
import { lensAuthenticationHeader } from "../vars/auth-header";
import fetchModuleInjectable from "./fetch-module.injectable";
import fetchInjectable from "./fetch.injectable";

export type AuthenticatedRequestInit = Omit<RequestInit, "agent">;

export type AuthenticatedFetch = (url: string, options?: AuthenticatedRequestInit) => Promise<Response>;

/**
 * This injectable should not be used to request data from external sources as it would leak the
 * authentication header value
 */
const lensAuthenticatedFetchInjectable = getInjectable({
  id: "lens-authenticated-fetch",
  instantiate: (di): AuthenticatedFetch => {
    const authHeaderValue = di.inject(lensAuthenticationHeaderValueInjectionToken);
    const lensAuthenticatedAgent = di.inject(lensAuthenticatedAgentInjectable);
    const fetch = di.inject(fetchInjectable);
    const { Headers } = di.inject(fetchModuleInjectable);

    return async (url, init) => {
      const {
        headers: headersInit,
        ...rest
      } = init ?? {};
      const headers = new Headers(headersInit);

      headers.set(lensAuthenticationHeader, `Bearer ${authHeaderValue}`);

      return fetch(url, {
        headers,
        ...rest,
        agent: lensAuthenticatedAgent,
      });
    };
  },
});

export default lensAuthenticatedFetchInjectable;

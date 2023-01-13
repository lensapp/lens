/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Agent } from "https";
import type { RequestInit, Response } from "node-fetch";
import authHeaderValueInjectable from "../../features/auth-header/common/header-value.injectable";
import { lensAuthHeaderName } from "../../features/auth-header/common/vars";
import lensProxyPortInjectable from "../../main/lens-proxy/lens-proxy-port.injectable";
import lensProxyCertificateInjectable from "../certificate/lens-proxy-certificate.injectable";
import nodeFetchModuleInjectable from "./fetch-module.injectable";

export type LensRequestInit = Omit<RequestInit, "agent">;

export type LensFetch = (pathnameAndQuery: string, init?: LensRequestInit) => Promise<Response>;

const lensFetchInjectable = getInjectable({
  id: "lens-fetch",
  instantiate: (di): LensFetch => {
    const { default: fetch, Headers } = di.inject(nodeFetchModuleInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectable);
    const authHeaderValue = di.inject(authHeaderValueInjectable);

    return async (pathnameAndQuery, {
      headers: _headers,
      ...init
    } = {}) => {
      const agent = new Agent({
        ca: lensProxyCertificate.get().cert,
      });
      const headers = new Headers(_headers);

      headers.set(lensAuthHeaderName, authHeaderValue);

      return fetch(`https://127.0.0.1:${lensProxyPort.get()}${pathnameAndQuery}`, {
        ...init,
        agent,
        headers,
      });
    };
  },
  causesSideEffects: true,
});

export default lensFetchInjectable;

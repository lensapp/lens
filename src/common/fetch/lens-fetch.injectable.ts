/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Agent } from "https";
import type { RequestInit, Response } from "node-fetch";
import lensProxyPortInjectable from "../../main/lens-proxy/lens-proxy-port.injectable";
import lensProxyCertificateInjectable from "../certificate/lens-proxy-certificate.injectable";
import nodeFetchModuleInjectable from "./fetch-module.injectable";

export type LensFetch = (pathnameAndOrQuery: string, init?: Omit<RequestInit, "agent">) => Promise<Response>;

/**
 * This fetch is for requesting items from the Lens Proxy and thus does not cause side effects
 */
const lensFetchInjectable = getInjectable({
  id: "lens-fetch",
  instantiate: (di): LensFetch => {
    const { default: fetch } = di.inject(nodeFetchModuleInjectable);
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectable);

    return async (pathnameAndOrQuery, init) => fetch(`https://127.0.0.1:${lensProxyPort.get()}${pathnameAndOrQuery}`, {
      ...init,
      agent: new Agent({
        ca: lensProxyCertificate.get().cert,
      }),
    });
  },
});

export default lensFetchInjectable;

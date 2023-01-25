/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Agent } from "https";
import type { RequestInit, Response } from "@k8slens/node-fetch";
import lensProxyPortInjectable from "../../main/lens-proxy/lens-proxy-port.injectable";
import lensProxyCertificateInjectable from "../certificate/lens-proxy-certificate.injectable";
import fetch from "@k8slens/node-fetch";

export type LensRequestInit = Omit<RequestInit, "agent">;

export type LensFetch = (pathnameAndQuery: string, init?: LensRequestInit) => Promise<Response>;

const lensFetchInjectable = getInjectable({
  id: "lens-fetch",
  instantiate: (di): LensFetch => {
    const lensProxyPort = di.inject(lensProxyPortInjectable);
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectable);

    return async (pathnameAndQuery, init = {}) => {
      const agent = new Agent({
        ca: lensProxyCertificate.get().cert,
      });

      return fetch(`https://127.0.0.1:${lensProxyPort.get()}${pathnameAndQuery}`, {
        ...init,
        agent,
      });
    };
  },
  causesSideEffects: true,
});

export default lensFetchInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Agent } from "https";
import type { RequestInit, Response } from "@k8slens/node-fetch";
import lensProxyCertificateInjectable from "../../../common/certificate/lens-proxy-certificate.injectable";
import fetch from "@k8slens/node-fetch";
import { lensFetchBaseUrlInjectionToken } from "./lens-fetch-base-url";

export type LensRequestInit = Omit<RequestInit, "agent">;

export type LensFetch = (pathnameAndQuery: string, init?: LensRequestInit) => Promise<Response>;

const lensFetchInjectable = getInjectable({
  id: "lens-fetch",
  instantiate: (di): LensFetch => {
    const lensProxyCertificate = di.inject(lensProxyCertificateInjectable);

    return async (pathnameAndQuery, init = {}) => {
      const agent = new Agent({
        ca: lensProxyCertificate.get().cert,
        keepAlive: true,
      });

      return fetch(`${di.inject(lensFetchBaseUrlInjectionToken)}${pathnameAndQuery}`, {
        ...init,
        agent,
      });
    };
  },
  causesSideEffects: true,
});

export default lensFetchInjectable;

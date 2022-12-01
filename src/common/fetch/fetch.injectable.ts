/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { HttpsProxyAgent } from "hpagent";
import type * as FetchModule from "node-fetch";
import userStoreInjectable from "../user-store/user-store.injectable";

const { NodeFetch: { default: fetch }} = require("../../../build/webpack/node-fetch.bundle") as { NodeFetch: typeof FetchModule };

type Response = FetchModule.Response;
type RequestInit = FetchModule.RequestInit;

export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

const fetchInjectable = getInjectable({
  id: "fetch",
  instantiate: (di): Fetch => {
    const { httpsProxy, allowUntrustedCAs } = di.inject(userStoreInjectable);
    const agent = httpsProxy
      ? new HttpsProxyAgent({
        proxy: httpsProxy,
        rejectUnauthorized: !allowUntrustedCAs,
      })
      : undefined;

    return (url, init = {}) => fetch(url, {
      agent,
      ...init,
    });
  },
  causesSideEffects: true,
});

export default fetchInjectable;

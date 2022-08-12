/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken, getInjectable } from "@ogre-tools/injectable";
import type * as FetchModule from "node-fetch";

type Response = FetchModule.Response;
type RequestInit = FetchModule.RequestInit;

export type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

export const fetchImplInjectionToken = getInjectionToken<Promise<typeof FetchModule>>({
  id: "fetch-impl-token",
});

const fetchInjectable = getInjectable({
  id: "fetch",
  instantiate: (di): Fetch => {
    let fetchP: Promise<typeof FetchModule> | undefined;

    return async (url, init) => {
      /**
       * This is done so that there are no timing issues with the first use of `fetchInjectable`.
       */
      const fetch = (await (fetchP ??= di.inject(fetchImplInjectionToken))).default;

      return fetch(url, init);
    };
  },
});

export default fetchInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import lensFetchInjectable from "../../../../common/fetch/lens-fetch.injectable";
import type { AbortSignal as NonStandardAbortSignal } from "abort-controller";

export interface RequestOptions {
  signal: AbortSignal;
}

export type RequestAppVersionViaProxy = (options: RequestOptions) => Promise<string>;

const requestAppVersionViaProxyInjectable = getInjectable({
  id: "request-app-version-via-proxy",
  instantiate: (di): RequestAppVersionViaProxy => {
    const lensFetch = di.inject(lensFetchInjectable);

    return async (options) => {
      const response = await lensFetch("/version", {
        signal: options.signal as NonStandardAbortSignal,
      });

      if (response.status !== 200) {
        throw new Error(`Retrieving version failed: ${response.statusText}`);
      }

      const body = await response.json() as { version: string };

      return body.version;
    };
  },
});

export default requestAppVersionViaProxyInjectable;

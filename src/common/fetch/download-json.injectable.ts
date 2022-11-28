/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { RequestInit, Response } from "node-fetch";
import type { AsyncResult } from "../utils/async-result";
import fetchInjectable from "./fetch.injectable";

export interface DownloadJsonOptions {
  signal?: AbortSignal | null | undefined;
}

export type DownloadJson = (url: string, opts?: DownloadJsonOptions) => Promise<AsyncResult<unknown, string>>;

const downloadJsonInjectable = getInjectable({
  id: "download-json",
  instantiate: (di): DownloadJson => {
    const fetch = di.inject(fetchInjectable);

    return async (url, opts) => {
      let result: Response;

      try {
        result = await fetch(url, opts as RequestInit);
      } catch (error) {
        return {
          callWasSuccessful: false,
          error: String(error),
        };
      }

      if (result.status < 200 || 300 <= result.status) {
        return {
          callWasSuccessful: false,
          error: result.statusText,
        };
      }

      try {
        return {
          callWasSuccessful: true,
          response: await result.json(),
        };
      } catch (error) {
        return {
          callWasSuccessful: false,
          error: String(error),
        };
      }
    };
  },
});

export default downloadJsonInjectable;

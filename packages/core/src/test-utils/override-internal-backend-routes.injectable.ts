/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import lensFetchInjectable from "../common/fetch/lens-fetch.injectable";
import { Headers, Response } from "@k8slens/node-fetch";
import handleRouteRequestInjectable from "../main/lens-proxy/handle-route-request.injectable";
import fetchInjectable from "../common/fetch/fetch.injectable";
import * as Shot from "@hapi/shot";

export const overrideFetchingInternalRoutes = (mainDi: DiContainer, targetDi = mainDi) => {
  targetDi.override(lensFetchInjectable, () => async (pathname, init = {}) => {
    // NOTE: This injects things from the other environment on purpose
    const handleRouteRequest = mainDi.inject(handleRouteRequestInjectable);

    const response = await Shot.inject(
      handleRouteRequest as Shot.MaybeInjectionListener,
      {
        url: pathname,
        headers: new Headers(init?.headers).raw(),
        method: init?.method,
        payload: init?.body ?? undefined,
      },
    );

    return new Response(response.rawPayload, {
      headers: Object.entries(response.headers).map(([key, value]) => {
        if (value === undefined) {
          return [key];
        } else if (Array.isArray(value)) {
          return [key, value.join(",")];
        } else {
          return [key, value.toString()];
        }
      }),
      status: response.statusCode,
      statusText: response.statusMessage,
    });
  });

  targetDi.override(fetchInjectable, () => async (rawUrl, init = {}) => {
    // NOTE: This injects things from the other environment on purpose
    const handleRouteRequest = mainDi.inject(handleRouteRequestInjectable);
    const url = new URL(rawUrl);

    switch (url.host) {
      case "localhost":
      case "127.0.0.1":
      case "lens.app":
        break;
      default:
        if (url.host.endsWith(".lens.app")) {
          break;
        }

        throw new Error("Tried to fetch an external resource");
    }

    const response = await Shot.inject(
      handleRouteRequest as Shot.MaybeInjectionListener,
      {
        url: url.pathname,
        headers: new Headers(init?.headers).raw(),
        method: init?.method,
        payload: init?.body ?? undefined,
      },
    );

    return new Response(response.rawPayload, {
      headers: Object.entries(response.headers).map(([key, value]) => {
        if (value === undefined) {
          return [key];
        } else if (Array.isArray(value)) {
          return [key, value.join(",")];
        } else {
          return [key, value.toString()];
        }
      }),
      status: response.statusCode,
      statusText: response.statusMessage,
    });
  });
};

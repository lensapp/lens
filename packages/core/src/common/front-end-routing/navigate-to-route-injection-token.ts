/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { RequiredKeysOf } from "type-fest";
import type { Route } from "./front-end-route-injection-token";

type InferParametersFrom<TRoute> = TRoute extends Route<infer TParameters extends object>
  ? TParameters
  : never;

type Parameters<TParameters extends object> = TParameters extends void
  ? { parameters?: undefined }
  : (
    RequiredKeysOf<TParameters> extends never
      ? { parameters?: TParameters }
      : { parameters: TParameters }
  );

export type NavigateToRouteOptions<TRoute> = Parameters<
  InferParametersFrom<TRoute>
> & {
  query?: Record<string, string>;
  fragment?: string;
  withoutAffectingBackButton?: boolean;
};

export type NavigateToRoute = <TRoute extends Route<unknown>>(
  route: TRoute,
  options?: NavigateToRouteOptions<TRoute>) => void;

export const navigateToRouteInjectionToken = getInjectionToken<NavigateToRoute>(
  { id: "navigate-to-route-injection-token" },
);

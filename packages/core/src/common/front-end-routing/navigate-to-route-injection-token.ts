/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { HasRequiredKeys } from "type-fest";
import type { Route } from "./front-end-route-injection-token";

export type NavigateWithParameterOptions<TParameters extends object> = (
  HasRequiredKeys<TParameters> extends true
    ? { parameters: TParameters }
    : { parameters?: TParameters }
);

export type NavigateWithParameterOptionsForRoute<TRoute> = (
  TRoute extends Route<infer Params extends object>
    ? NavigateWithParameterOptions<Params>
    : { parameters?: undefined }
);

export interface BaseNavigateToRouteOptions {
  query?: Record<string, string>;
  fragment?: string;
  withoutAffectingBackButton?: boolean;
}

export type NavigateToRouteOptions<TRoute> = (
  TRoute extends Route<void>
    ? ([] | [options: BaseNavigateToRouteOptions])
    : TRoute extends Route<infer Params extends object>
      ? HasRequiredKeys<Params> extends true
        ? [options: BaseNavigateToRouteOptions & { parameters: Params }]
        : ([] | [options: BaseNavigateToRouteOptions & { parameters?: Params }])
      : ([] | [options: BaseNavigateToRouteOptions])
);

export interface NavigateToRoute {
  <Route>(route: Route, ...options: NavigateToRouteOptions<Route>): void;
}

export const navigateToRouteInjectionToken = getInjectionToken<NavigateToRoute>(
  { id: "navigate-to-route-injection-token" },
);

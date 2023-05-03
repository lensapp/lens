/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { RequiredKeysOf } from "type-fest";
import type { Route } from "./front-end-route-injection-token";

export type NavigateWithParameterOptions<TParameters> = (
  TParameters extends object
    ? RequiredKeysOf<TParameters> extends never
      ? { parameters?: TParameters }
      : { parameters: TParameters }
    : { parameters?: undefined }
);
export interface BaseNavigateToRouteOptions {
  query?: Record<string, string>;
  fragment?: string;
  withoutAffectingBackButton?: boolean;
  parameters?: undefined;
}

export interface NavigateToRoute {
  (route: Route<void>, options?: BaseNavigateToRouteOptions): void;
  <R extends Route<Params>, Params>(route: R, options: BaseNavigateToRouteOptions & NavigateWithParameterOptions<Params>): void;
}

export const navigateToRouteInjectionToken = getInjectionToken<NavigateToRoute>(
  { id: "navigate-to-route-injection-token" },
);

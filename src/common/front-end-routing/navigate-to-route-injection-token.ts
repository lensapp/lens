/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Route } from "./front-end-route-injection-token";

type RequiredKeys<T> = Exclude<
  {
    [K in keyof T]: T extends Record<K, T[K]> ? K : never;
  }[keyof T],
  undefined
>;

type ObjectContainingNoRequired<T> = T extends void
  ? never
  : RequiredKeys<T> extends []
  ? any
  : never;

type ObjectContainsNoRequired<T> = T extends ObjectContainingNoRequired<T>
  ? true
  : false;

// TODO: Missing types for:
// - Navigating to route with required parameters, without parameters
type Parameters<TParameters> = ObjectContainsNoRequired<TParameters> extends true
  ? { parameters?: TParameters }
  : { parameters: TParameters };

export type NavigateToRouteOptions<TParameter extends object> = Parameters<TParameter> & BaseNavigateToRouteOptions;

export interface BaseNavigateToRouteOptions {
  query?: Record<string, string>;
  fragment?: string;
  withoutAffectingBackButton?: boolean;
}

export interface NavigateToRoute {
  (route: Route<void>, options?: BaseNavigateToRouteOptions): void;
  <TParameters extends Record<TRequiredKeys, string | number>, TRequiredKeys extends string>(route: Route<TParameters>, opts: NavigateToRouteOptions<TParameters>): void;
  <TParameters extends object>(route: Route<TParameters>, opts?: NavigateToRouteOptions<TParameters>): void;
}

export const navigateToRouteInjectionToken = getInjectionToken<NavigateToRoute>({
  id: "navigate-to-route-injection-token",
});

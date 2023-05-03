/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectionToken } from "@ogre-tools/injectable";
import type { HasRequiredKeys } from "type-fest";
import type { InferParamFromPath, Route } from "./front-end-route-injection-token";

export type NavigateWithParameterOptions<TParameters extends object> = (
  HasRequiredKeys<TParameters> extends true
    ? { parameters: TParameters }
    : { parameters?: TParameters }
);

export interface BaseNavigateToRouteOptions {
  query?: Record<string, string>;
  fragment?: string;
  withoutAffectingBackButton?: boolean;
}

export type NavigateToRouteOptions<Path extends string> = (
  HasRequiredKeys<InferParamFromPath<Path>> extends true
    ? ([options: BaseNavigateToRouteOptions & { parameters: InferParamFromPath<Path> }])
    : ([] | [options: BaseNavigateToRouteOptions & { parameters?: InferParamFromPath<Path> }])
);

export interface NavigateToRoute {
  <Path extends string>(route: Route<Path>, ...options: NavigateToRouteOptions<Path>): void;
}

export type NavigateToSpecificRoute<InjectableRoute> =
  InjectableRoute extends Injectable<Route<infer Path>, Route<string>, void>
    ? HasRequiredKeys<InferParamFromPath<Path>> extends true
      ? (parameters: InferParamFromPath<Path>) => void
      : (parameters?: InferParamFromPath<Path>) => void
    : never;

export const navigateToRouteInjectionToken = getInjectionToken<NavigateToRoute>(
  { id: "navigate-to-route-injection-token" },
);

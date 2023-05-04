/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { InferParamFromPath, Route } from "../../common/front-end-routing/front-end-route-injection-token";

export const routeSpecificComponentInjectionToken = getInjectionToken<{
  route: Route<string>;
  Component: React.ComponentType<{ params: InferParamFromPath<string> }>;
}>({
  id: "route-specific-component-injection-token",
});

export interface GetRouteSpecificComponentOptions<Path extends string> {
  id: string;
  routeInjectable: Injectable<Route<Path>, Route<string>, void>;
  Component: React.ComponentType<{ params: InferParamFromPath<Path> }>;
}

export interface GetRouteSpecificComponentInjectable {
  <Path extends string>(options: {
  id: string;
  routeInjectable: Injectable<Route<Path>, Route<string>, void>;
  Component: React.ComponentType<{ params: InferParamFromPath<Path> }>;
}): Injectable<{
    route: Route<Path>;
    Component: React.ComponentType<{ params: InferParamFromPath<Path> }>;
  }, unknown, void>;
  <Path extends string>(options: {
  id: string;
  routeInjectable: Injectable<Route<Path>, Route<string>, void>;
  Component: React.ComponentType<{ params?: InferParamFromPath<Path> }>;
}): Injectable<{
    route: Route<Path>;
    Component: React.ComponentType<{ params?: InferParamFromPath<Path> }>;
  }, unknown, void>;
}

export const getRouteSpecificComponentInjectable = ((options) => getInjectable({
  id: options.id,
  instantiate: (di) => ({
    route: di.inject(options.routeInjectable),
    Component: options.Component as React.ComponentType<{ params: InferParamFromPath<string> }>,
  }),
  injectionToken: routeSpecificComponentInjectionToken,
})) as GetRouteSpecificComponentInjectable;

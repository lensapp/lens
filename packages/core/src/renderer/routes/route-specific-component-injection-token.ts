/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Injectable } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import type { Route } from "../../common/front-end-routing/front-end-route-injection-token";

export const routeSpecificComponentInjectionToken = getInjectionToken<{
  route: Route<unknown>;
  Component: React.ComponentType<unknown>;
}>({
  id: "route-specific-component-injection-token",
});

export interface GetRouteSpecificComponentOptions<Params> {
  id: string;
  routeInjectable: Injectable<Route<Params>, Route<unknown>, void>;
  Component: Params extends object ? React.ComponentType<Params> : React.ComponentType;
}

export const getRouteSpecificComponentInjectable = <Params>(options: GetRouteSpecificComponentOptions<Params>) => getInjectable({
  id: options.id,
  instantiate: (di) => ({
    route: di.inject(options.routeInjectable),
    Component: options.Component as React.ComponentType<unknown>,
  }),
  injectionToken: routeSpecificComponentInjectionToken,
});

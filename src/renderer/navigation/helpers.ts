/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LocationDescriptor } from "history";
import { createPath } from "history";
import type { RouteProps } from "react-router";
import { matchPath } from "react-router";
import { navigation } from "./history";
import type { PageParamInit } from "./page-param";
import { PageParam } from "./page-param";

/**
 * @deprecated use `di.inject(navigateInjectable)` instead
 */
export function navigate(location: LocationDescriptor) {
  const currentLocation = createPath(navigation.location);

  navigation.push(location);

  const newLocation = createPath(navigation.location);

  if (currentLocation === newLocation) {
    navigation.goBack(); // prevent sequences of same url in history
  }
}

export function createPageParam<V = string>(init: PageParamInit<V>) {
  return new PageParam<V>(init, navigation);
}

export function matchRoute<P>(route: string | string[] | RouteProps) {
  return matchPath<P>(navigation.location.pathname, route);
}

export function isActiveRoute(route: string | string[] | RouteProps): boolean {
  return !!matchRoute(route);
}

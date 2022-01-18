/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LocationDescriptor } from "history";
import { createPath } from "history";
import { matchPath, RouteProps } from "react-router";
import { navigation } from "./history";
import { ClusterViewRouteParams, clusterViewRoute } from "../../common/routes";
import { PageParam, PageParamInit } from "./page-param";

export function navigate(location: LocationDescriptor) {
  const currentLocation = createPath(navigation.location);

  navigation.push(location);

  const newLocation = createPath(navigation.location);

  if (currentLocation === newLocation) {
    navigation.goBack(); // prevent sequences of same url in history
  }
}

export function navigateWithoutHistoryChange(location: Partial<Location>) {
  navigation.merge(location, true);
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

export function getMatchedClusterId(): string | undefined {
  const matched = matchPath<ClusterViewRouteParams>(navigation.location.pathname, {
    exact: true,
    path: clusterViewRoute.path,
  });

  return matched?.params.clusterId;
}

/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { LocationDescriptor } from "history";
import { matchPath, RouteProps } from "react-router";
import { PageParam, PageParamInit } from "./page-param";
import { clusterViewRoute, IClusterViewRouteParams } from "../components/cluster-manager/cluster-view.route";
import { navigation } from "./history";

export function navigate(location: LocationDescriptor) {
  const currentLocation = navigation.location.pathname;

  navigation.push(location);

  if (currentLocation === navigation.location.pathname) {
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

export function getMatchedClusterId(): string {
  const matched = matchPath<IClusterViewRouteParams>(navigation.location.pathname, {
    exact: true,
    path: clusterViewRoute.path
  });

  return matched?.params.clusterId;
}

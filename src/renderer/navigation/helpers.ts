// Navigation helpers

import { matchPath, RouteProps } from "react-router";
import { LocationDescriptor } from "history";
import { clusterViewRoute, IClusterViewRouteParams } from "../components/cluster-manager/cluster-view.route";
import { navigation } from "./index";

export function navigate(location: LocationDescriptor) {
  const currentLocation = navigation.getPath();
  navigation.push(location);
  if (currentLocation === navigation.getPath()) {
    navigation.goBack(); // prevent sequences of same url in history
  }
}

export function matchParams<P>(route: string | string[] | RouteProps) {
  return matchPath<P>(navigation.location.pathname, route);
}

export function isActiveRoute(route: string | string[] | RouteProps): boolean {
  return !!matchParams(route);
}

export function getMatchedClusterId(): string {
  const matched = matchPath<IClusterViewRouteParams>(navigation.location.pathname, {
    exact: true,
    path: clusterViewRoute.path
  });
  return matched?.params.clusterId;
}

// Navigation helpers

import { ipcRenderer } from "electron";
import { reaction } from "mobx";
import { matchPath, RouteProps } from "react-router";
import { createObservableHistory } from "mobx-observable-history";
import { createBrowserHistory, createMemoryHistory, LocationDescriptor } from "history";
import { broadcastMessage, subscribeToBroadcast } from "../../common/ipc";
import { PageParam, PageParamInit } from "./page-param";
import { clusterViewRoute, IClusterViewRouteParams } from "../components/cluster-manager/cluster-view.route";
import logger from "../../main/logger";

export let history = ipcRenderer ? createBrowserHistory() : createMemoryHistory();
export let navigation = createObservableHistory(history);

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

export function createPageParam<V = string>(init: PageParamInit<V>) {
  return new PageParam<V>(init, navigation);
}

if (ipcRenderer) {
  history = createBrowserHistory();
  navigation = createObservableHistory(history);

  if (process.isMainFrame) {
    // Keep track of active cluster-id for handling IPC/menus/etc.
    reaction(() => getMatchedClusterId(), clusterId => {
      broadcastMessage("cluster-view:current-id", clusterId);
    }, {
      fireImmediately: true
    });
  }

  // Handle navigation via IPC (e.g. from top menu)
  subscribeToBroadcast("renderer:navigate", (event, url: string) => {
    logger.info(`[IPC]: ${event.type} ${JSON.stringify(url)}`, event);
    navigate(url);
  });

  // Reload dashboard window
  subscribeToBroadcast("renderer:reload", () => {
    location.reload();
  });
}

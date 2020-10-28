// Navigation helpers

import { ipcRenderer } from "electron";
import { matchPath } from "react-router";
import { reaction } from "mobx";
import { createObservableHistory } from "mobx-observable-history";
import { createBrowserHistory, createMemoryHistory, LocationDescriptor } from "history";
import logger from "../main/logger";
import { clusterViewRoute, IClusterViewRouteParams } from "./components/cluster-manager/cluster-view.route";

export const history = typeof window !== "undefined" ? createBrowserHistory() : createMemoryHistory();
export const navigation = createObservableHistory(history);

export function navigate(location: LocationDescriptor) {
  const currentLocation = navigation.getPath();
  navigation.push(location);
  if (currentLocation === navigation.getPath()) {
    navigation.goBack(); // prevent sequences of same url in history
  }
}

// common params for all pages
export interface IQueryParams {
  namespaces?: string[];  // selected context namespaces
  details?: string;      // serialized resource details
  selected?: string;     // mark resource as selected
  search?: string;       // search-input value
  sortBy?: string;       // sorting params for table-list
  orderBy?: string;
}

export function getQueryString(params?: Partial<IQueryParams>, merge = true) {
  const searchParams = navigation.searchParams.copyWith(params);
  if (!merge) {
    Array.from(searchParams.keys()).forEach(key => {
      if (!(key in params)) searchParams.delete(key)
    })
  }
  return searchParams.toString({ withPrefix: true })
}

export function setQueryParams<T>(params?: T & IQueryParams, { merge = true, replace = false } = {}) {
  const newSearch = getQueryString(params, merge);
  navigation.merge({ search: newSearch }, replace);
}

export function getDetails() {
  return navigation.searchParams.get("details")
}

export function getSelectedDetails() {
  return navigation.searchParams.get("selected") || getDetails()
}

export function getDetailsUrl(details: string) {
  if (!details) return "";
  return getQueryString({
    details: details,
    selected: getSelectedDetails(),
  });
}

export function showDetails(path: string, resetSelected = true) {
  navigation.searchParams.merge({
    details: path,
    selected: resetSelected ? null : getSelectedDetails(),
  })
}

export function hideDetails() {
  showDetails(null)
}

export function setSearch(text: string) {
  navigation.replace({
    search: getQueryString({ search: text })
  })
}

export function getSearch() {
  return navigation.searchParams.get("search") || "";
}

export function getMatchedClusterId(): string {
  const matched = matchPath<IClusterViewRouteParams>(navigation.location.pathname, {
    exact: true,
    path: clusterViewRoute.path
  });
  return matched?.params.clusterId;
}

//-- EVENTS

if (process.isMainFrame) {
  // Keep track of active cluster-id for handling IPC/menus/etc.
  reaction(() => getMatchedClusterId(), clusterId => {
    ipcRenderer.send("cluster-view:current-id", clusterId);
  }, {
    fireImmediately: true
  })
}

// Handle navigation via IPC (e.g. from top menu)
ipcRenderer.on("menu:navigate", (event, location: LocationDescriptor) => {
  logger.info(`[IPC]: ${event.type} ${JSON.stringify(location)}`, event);
  navigate(location);
});

// Reload dashboard window
ipcRenderer.on("menu:reload", () => {
  location.reload();
});

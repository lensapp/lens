// Navigation helpers

import { ipcRenderer } from "electron";
import { compile } from "path-to-regexp"
import { createBrowserHistory, createMemoryHistory, LocationDescriptor } from "history";
import { createObservableHistory } from "mobx-observable-history";
import logger from "../main/logger";

export const history = typeof window !== "undefined" ? createBrowserHistory() : createMemoryHistory();
export const navigation = createObservableHistory(history);

// handle navigation from other process (e.g. system menus in main, common->cluster view interactions)
if (ipcRenderer) {
  ipcRenderer.on("menu:navigate", (event, location: LocationDescriptor) => {
    logger.info(`[IPC]: ${event.type} ${JSON.stringify(location)}`, event);
    navigate(location);
  })
}

export function navigate(location: LocationDescriptor) {
  navigation.push(location);
}

export interface IURLParams<P = {}, Q = {}> {
  params?: P;
  query?: IQueryParams & Q;
}

// todo: extract building urls to commons (also used in menu.ts)
// fixme: missing types validation for params & query
export function buildURL<P extends object, Q = object>(path: string | string[]) {
  const pathBuilder = compile(path.toString());
  return function ({ params, query }: IURLParams<P, Q> = {}) {
    return pathBuilder(params) + (query ? getQueryString(query, false) : "")
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

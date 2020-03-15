// Navigation helpers

import pathToRegexp from "path-to-regexp"
import { createBrowserHistory, Location, LocationDescriptor } from "history";
import { createObservableHistory } from "mobx-observable-history";

export const browserHistory = createBrowserHistory();
export const navigation = createObservableHistory(browserHistory);

export function navigate(location: LocationDescriptor) {
  navigation.location = location as Location;
}

export interface IURLParams<P = {}, Q = {}> {
  params?: P;
  query?: IQueryParams & Q;
}

export function buildURL<P extends object, Q = object>(path: string | string[]) {
  const pathBuilder = pathToRegexp.compile(path.toString());
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

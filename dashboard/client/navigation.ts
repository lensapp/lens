// Navigation helpers

import pathToRegexp from "path-to-regexp";
import { createBrowserHistory, Location, LocationDescriptor } from "history";
import { createObservableHistory } from "mobx-observable-history";

export const browserHistory = createBrowserHistory();
export const navigation = createObservableHistory(browserHistory);

export function navigate(location: LocationDescriptor): void {
  navigation.location = location as Location;
}

export interface URLParams<P = {}, Q = {}> {
  params?: P;
  query?: QueryParams & Q;
}

// common params for all pages
export interface QueryParams {
  namespaces?: string[];  // selected context namespaces
  details?: string;      // serialized resource details
  selected?: string;     // mark resource as selected
  search?: string;       // search-input value
  sortBy?: string;       // sorting params for table-list
  orderBy?: string;
}

export function getQueryString(params?: Partial<QueryParams>, merge = true): string {
  const searchParams = navigation.searchParams.copyWith(params);
  if (!merge) {
    Array.from(searchParams.keys()).forEach(key => {
      if (!(key in params)) {
        searchParams.delete(key);
      }
    });
  }
  return searchParams.toString({ withPrefix: true });
}

export function buildURL<P extends object, Q = object>(path: string | string[]): ({ params, query }?: URLParams<P, Q>) => string {
  const pathBuilder = pathToRegexp.compile(path.toString());
  
  return function ({ params, query }: URLParams<P, Q> = {}): string {
    return pathBuilder(params) + (query ? getQueryString(query, false) : "");
  };
}

export function setQueryParams<T>(params?: T & QueryParams, { merge = true, replace = false } = {}): void {
  const newSearch = getQueryString(params, merge);
  navigation.merge({ search: newSearch }, replace);
}

export function getDetails(): string {
  return navigation.searchParams.get("details");
}

export function getSelectedDetails(): string {
  return navigation.searchParams.get("selected") || getDetails();
}

export function getDetailsUrl(details: string): string {
  return getQueryString({
    details: details,
    selected: getSelectedDetails(),
  });
}

export function showDetails(path: string, resetSelected = true): void {
  navigation.searchParams.merge({
    details: path,
    selected: resetSelected ? null : getSelectedDetails(),
  });
}

export function hideDetails(): void {
  showDetails(null);
}

export function setSearch(text: string): void {
  navigation.replace({
    search: getQueryString({ search: text })
  });
}

export function getSearch(): string {
  return navigation.searchParams.get("search") || "";
}

import { compile } from "path-to-regexp"

export interface IURLParams<P extends object = {}, Q extends object = {}> {
  params?: P;
  query?: Q;
}

export function buildURL<P extends object = {}, Q extends object = {}>(path: string | any) {
  const pathBuilder = compile(String(path));
  return function ({ params, query }: IURLParams<P, Q> = {}) {
    const queryParams = query ? new URLSearchParams(Object.entries(query)).toString() : ""
    return pathBuilder(params) + (queryParams ? `?${queryParams}` : "")
  }
}

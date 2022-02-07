/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { compile } from "path-to-regexp";
import type { RouteProps as RouterProps } from "react-router";
import { format } from "url";

export interface RouteProps extends RouterProps {
  path?: string;
}

type MaybeIfRecord<FieldName extends string, Type> = Type extends object
  ? { [field in FieldName]?: Type }
  : {};

export type URLParams<P = unknown, Q = unknown> = {
  fragment?: string;
} & MaybeIfRecord<"params", P> & MaybeIfRecord<"query", Q>;

interface InternalURLParams<P, Q> {
  fragment?: string;
  params?: P;
  query?: Q;
}

export function buildURL<P = unknown, Q = unknown>(path: string): (urlParams?: URLParams<P, Q>) => string {
  const pathBuilder = compile(path);

  return (urlParams) => {
    const { params = {}, query = {}, fragment } = urlParams as InternalURLParams<P, Q> ?? {};

    return format({
      pathname: pathBuilder(params),
      query: new URLSearchParams(query).toString(),
      search: fragment,
    });
  };
}

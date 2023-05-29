/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type http from "http";
import type httpProxy from "http-proxy";
import type { URLSearchParams } from "url";
import type Joi from "joi";

export interface LensApiResultContentType {
  resultMapper: (result: LensApiResult<unknown>) => {
    statusCode: number;
    content: unknown;
    headers: Record<string, string>;
  };
}

export type InferParam<
  T extends string,
  PathParams extends Record<string, string>
> = T extends `{${infer P}?}`
  ? PathParams & Partial<Record<P, string>>
  : T extends `{${infer P}}`
  ? PathParams & Record<P, string>
  : PathParams;

export type InferParamFromPath<P extends string> =
  P extends `${string}/{${infer B}*}${infer Tail}`
    ? Tail extends ""
      ? Record<B, string>
      : never
    : P extends `${infer A}/${infer B}`
    ? InferParam<A, InferParamFromPath<B>>
    : InferParam<P, {}>;

export interface LensApiRequest<Path extends string> {
  path: Path;
  payload: unknown;
  params: InferParamFromPath<Path>;
  query: URLSearchParams;
  raw: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  };
}

export interface LensApiResult<Response> {
  statusCode?: number;
  response?: Response;
  error?: any;
  contentType?: LensApiResultContentType;
  headers?: Partial<Record<string, string>>;
  proxy?: httpProxy;
}

export type RouteResponse<Response> = LensApiResult<Response> | void;

export interface RouteHandler<TResponse, Path extends string> {
  (request: LensApiRequest<Path>):
    | RouteResponse<TResponse>
    | Promise<RouteResponse<TResponse>>;
}

export interface BaseRoutePaths<Path extends string> {
  path: Path;
  method: "get" | "post" | "put" | "patch" | "delete";
}

export interface PayloadValidator<Payload> {
  validate(payload: unknown): Joi.ValidationResult<Payload>;
}

export interface ValidatorBaseRoutePaths<Path extends string, Payload>
  extends BaseRoutePaths<Path> {
  payloadValidator: PayloadValidator<Payload>;
}

export interface Route<TResponse, Path extends string>
  extends BaseRoutePaths<Path> {
  handler: RouteHandler<TResponse, Path>;
}

export interface BindHandler<Path extends string> {
  <TResponse>(handler: RouteHandler<TResponse, Path>): Route<TResponse, Path>;
}

export function route<Path extends string>(
  parts: BaseRoutePaths<Path>
): BindHandler<Path> {
  return (handler) => ({
    ...parts,
    handler,
  });
}

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";
import type http from "http";
import type httpProxy from "http-proxy";
import type { LensApiResultContentType } from "./router-content-types";
import type { URLSearchParams } from "url";
import type Joi from "joi";

export type InferParam<
  T extends string,
  PathParams extends Record<string, string>,
> =
  T extends `{${infer P}?}`
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
  cluster: Cluster | undefined;
  query: URLSearchParams;
  raw: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  };
}

export interface ClusterLensApiRequest<Path extends string> extends LensApiRequest<Path> {
  cluster: Cluster;
}

export interface LensApiResult<Response> {
  statusCode?: number;
  response?: Response;
  error?: any;
  contentType?: LensApiResultContentType;
  headers?: Partial<Record<string, string>>;
  proxy?: httpProxy;
}

export type RouteResponse<Response> =
  | LensApiResult<Response>
  | void;

export interface RouteHandler<TResponse, Path extends string>{
  (request: LensApiRequest<Path>): RouteResponse<TResponse> | Promise<RouteResponse<TResponse>>;
}

export interface BaseRoutePaths<Path extends string> {
  path: Path;
  method: "get" | "post" | "put" | "patch" | "delete";
}

export interface PayloadValidator<Payload> {
  validate(payload: unknown): Joi.ValidationResult<Payload>;
}

export interface ValidatorBaseRoutePaths<Path extends string, Payload> extends BaseRoutePaths<Path> {
  payloadValidator: PayloadValidator<Payload>;
}

export interface Route<TResponse, Path extends string> extends BaseRoutePaths<Path> {
  handler: RouteHandler<TResponse, Path>;
}

export interface BindHandler<Path extends string> {
  <TResponse>(handler: RouteHandler<TResponse, Path>): Route<TResponse, Path>;
}

export function route<Path extends string>(parts: BaseRoutePaths<Path>): BindHandler<Path> {
  return (handler) => ({
    ...parts,
    handler,
  });
}

export interface ClusterRouteHandler<Response, Path extends string>{
  (request: ClusterLensApiRequest<Path>): RouteResponse<Response> | Promise<RouteResponse<Response>>;
}

export interface BindClusterHandler<Path extends string> {
  <TResponse>(handler: ClusterRouteHandler<TResponse, Path>): Route<TResponse, Path>;
}

export function clusterRoute<Path extends string>(parts: BaseRoutePaths<Path>): BindClusterHandler<Path> {
  return (handler) => ({
    ...parts,
    handler: ({ cluster, ...rest }) => {
      if (!cluster) {
        return {
          error: "Cluster missing",
          statusCode: 400,
        };
      }

      return handler({ cluster, ...rest });
    },
  });
}

export interface ValidatedClusterLensApiRequest<Path extends string, Payload> extends ClusterLensApiRequest<Path> {
  payload: Payload;
}

export interface ValidatedClusterRouteHandler<Payload, Response, Path extends string> {
  (request: ValidatedClusterLensApiRequest<Path, Payload>): RouteResponse<Response> | Promise<RouteResponse<Response>>;
}

export interface BindValidatedClusterHandler<Path extends string, Payload> {
  <Response>(handler: ValidatedClusterRouteHandler<Payload, Response, Path>): Route<Response, Path>;
}

export function payloadValidatedClusterRoute<Path extends string, Payload>({ payloadValidator, ...parts }: ValidatorBaseRoutePaths<Path, Payload>): BindValidatedClusterHandler<Path, Payload> {
  const boundClusterRoute = clusterRoute(parts);

  return (handler) => boundClusterRoute(({ payload, ...rest }) => {
    const validationResult = payloadValidator.validate(payload);

    if (validationResult.error) {
      return {
        error: validationResult.error,
        statusCode: 400,
      };
    }

    return handler({
      payload: validationResult.value,
      ...rest,
    });
  });
}

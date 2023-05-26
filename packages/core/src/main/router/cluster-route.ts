/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";
import type { BaseRoutePaths, LensApiRequest, RouteResponse, ValidatorBaseRoutePaths } from "@k8slens/route";

export interface ClusterLensApiRequest<Path extends string> extends LensApiRequest<Path> {
  cluster: Cluster;
}

export interface ClusterRoute<TResponse, Path extends string> extends BaseRoutePaths<Path> {
  handler: ClusterRouteHandler<TResponse, Path>;
}

export interface ClusterRouteHandler<Response, Path extends string>{
  (request: ClusterLensApiRequest<Path>): RouteResponse<Response> | Promise<RouteResponse<Response>>;
}

export interface BindClusterHandler<Path extends string> {
  <TResponse>(handler: ClusterRouteHandler<TResponse, Path>): ClusterRoute<TResponse, Path>;
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
  <Response>(handler: ValidatedClusterRouteHandler<Payload, Response, Path>): ClusterRoute<Response, Path>;
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

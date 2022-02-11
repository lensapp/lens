/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import type { LensApiRequest } from "../../router";
import { apiPrefix } from "../../../common/vars";
import { respondJson } from "../../utils/http-responses";
import { PortForward } from "../port-forward/port-forward";

const getCurrentPortForward = async (request: LensApiRequest) => {
  const { params, query, response, cluster } = request;
  const { namespace, resourceType, resourceName } = params;
  const port = Number(query.get("port"));
  const forwardPort = Number(query.get("forwardPort"));

  const portForward = PortForward.getPortforward({
    clusterId: cluster.id, kind: resourceType, name: resourceName,
    namespace, port, forwardPort,
  });

  respondJson(response, { port: portForward?.forwardPort ?? null });
};

const getCurrentPortForwardRouteInjectable = getInjectable({
  id: "get-current-port-forward-route",

  instantiate: () => ({
    method: "get",
    path: `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`,
    handler: getCurrentPortForward,
  }),

  injectionToken: routeInjectionToken,
});

export default getCurrentPortForwardRouteInjectable;

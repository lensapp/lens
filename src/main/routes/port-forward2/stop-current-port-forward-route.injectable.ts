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
import logger from "../../logger";

const stopCurrentPortForward = async (request: LensApiRequest) => {
  const { params, query, response, cluster } = request;
  const { namespace, resourceType, resourceName } = params;
  const port = Number(query.get("port"));
  const forwardPort = Number(query.get("forwardPort"));

  const portForward = PortForward.getPortforward({
    clusterId: cluster.id, kind: resourceType, name: resourceName,
    namespace, port, forwardPort,
  });

  try {
    await portForward.stop();
    respondJson(response, { status: true });
  } catch (error) {
    logger.error("[PORT-FORWARD-ROUTE]: error stopping a port-forward", { namespace, port, forwardPort, resourceType, resourceName });

    return respondJson(response, {
      message: `error stopping a forward port ${port}`,
    }, 400);
  }
};

const stopCurrentPortForwardRouteInjectable = getInjectable({
  id: "stop-current-port-forward-route",

  instantiate: () => ({
    method: "delete",
    path: `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`,
    handler: stopCurrentPortForward,
  }),

  injectionToken: routeInjectionToken,
});

export default stopCurrentPortForwardRouteInjectable;

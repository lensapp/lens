/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensApiRequest } from "../router/router";
import logger from "../logger";
import { respondJson } from "../utils/http-responses";
import { PortForward } from "./port-forward/port-forward";

export class PortForwardRoute {
  static routeCurrentPortForward(request: LensApiRequest) {
    const { params, query, response, cluster } = request;
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));

    const portForward = PortForward.getPortforward({
      clusterId: cluster.id, kind: resourceType, name: resourceName,
      namespace, port, forwardPort,
    });

    respondJson(response, { port: portForward?.forwardPort ?? null });
  }

  static routeCurrentPortForwardStop(request: LensApiRequest) {
    const { params, query, response, cluster } = request;
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));

    const portForward = PortForward.getPortforward({
      clusterId: cluster.id, kind: resourceType, name: resourceName,
      namespace, port, forwardPort,
    });

    try {
      portForward.stop();
      respondJson(response, { status: true });
    } catch (error) {
      logger.error("[PORT-FORWARD-ROUTE]: error stopping a port-forward", { namespace, port, forwardPort, resourceType, resourceName });

      return respondJson(response, {
        message: `error stopping a forward port ${port}`,
      }, 400);
    }
  }
}

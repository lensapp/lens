/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { LensApiRequest } from "../router";
import { respondJson } from "../utils/http-responses";
import { PortForward } from "./port-forward/port-forward";

export class PortForwardRoute {
  static async routeCurrentPortForward(request: LensApiRequest) {
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
}

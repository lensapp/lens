/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../router/router.injectable";
import { apiPrefix } from "../../../common/vars";
import { PortForward } from "./functionality/port-forward";
import { clusterRoute } from "../../router/route";

const getCurrentPortForwardRouteInjectable = getRouteInjectable({
  id: "get-current-port-forward-route",

  instantiate: () => clusterRoute({
    method: "get",
    path: `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`,
  })(async ({ params, query, cluster }) => {
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));

    const portForward = PortForward.getPortforward({
      clusterId: cluster.id, kind: resourceType, name: resourceName,
      namespace, port, forwardPort,
    });

    return {
      response: {
        port: portForward?.forwardPort ?? null,
      },
    };
  }),
});

export default getCurrentPortForwardRouteInjectable;

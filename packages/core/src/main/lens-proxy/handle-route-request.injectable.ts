/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ServerResponse } from "http";
import { apiKubePrefix } from "../../common/vars";
import contentSecurityPolicyInjectable from "../../common/vars/content-security-policy.injectable";
import routeRequestInjectable from "../router/route-request.injectable";
import getClusterForRequestInjectable from "./get-cluster-for-request.injectable";
import type { ProxyIncomingMessage } from "./messages";
import proxyReqToClusterInjectable from "./proxy/attempt.injectable";

export type HandleRouteRequest = (req: ProxyIncomingMessage, res: ServerResponse) => Promise<void>;

const handleRouteRequestInjectable = getInjectable({
  id: "handle-route-request",
  instantiate: (di): HandleRouteRequest => {
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const routeRequest = di.inject(routeRequestInjectable);
    const contentSecurityPolicy = di.inject(contentSecurityPolicyInjectable);
    const proxyReqToCluster = di.inject(proxyReqToClusterInjectable);

    return async (req, res) => {
      const cluster = getClusterForRequest(req);

      if (cluster && req.url.startsWith(apiKubePrefix)) {
        await proxyReqToCluster(cluster, req, res);
      } else {
        res.setHeader("Content-Security-Policy", contentSecurityPolicy);
        await routeRequest(cluster, req, res);
      }
    };
  },
});

export default handleRouteRequestInjectable;

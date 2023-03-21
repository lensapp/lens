/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ServerResponse } from "http";
import { apiKubePrefix } from "../../common/vars";
import contentSecurityPolicyInjectable from "../../common/vars/content-security-policy.injectable";
import kubeAuthProxyServerInjectable from "../cluster/kube-auth-proxy-server.injectable";
import routeRequestInjectable from "../router/route-request.injectable";
import getClusterForRequestInjectable from "./get-cluster-for-request.injectable";
import { isLongRunningRequest } from "./helpers";
import type { ProxyIncomingMessage } from "./messages";
import rawHttpProxyInjectable from "./proxy/raw-proxy.injectable";

export type HandleRouteRequest = (req: ProxyIncomingMessage, res: ServerResponse) => Promise<void>;

const handleRouteRequestInjectable = getInjectable({
  id: "handle-route-request",
  instantiate: (di): HandleRouteRequest => {
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const routeRequest = di.inject(routeRequestInjectable);
    const proxy = di.inject(rawHttpProxyInjectable);
    const contentSecurityPolicy = di.inject(contentSecurityPolicyInjectable);

    return async (req, res) => {
      const cluster = getClusterForRequest(req);

      if (cluster && req.url.startsWith(apiKubePrefix)) {
        delete req.headers.authorization;
        req.url = req.url.replace(apiKubePrefix, "");

        const kubeAuthProxyServer = di.inject(kubeAuthProxyServerInjectable, cluster);
        const proxyTarget = await kubeAuthProxyServer.getApiTarget(isLongRunningRequest(req.url));

        if (proxyTarget) {
          return proxy.web(req, res, proxyTarget);
        }
      }

      res.setHeader("Content-Security-Policy", contentSecurityPolicy);
      await routeRequest(cluster, req, res);
    };
  },
});

export default handleRouteRequestInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ServerResponse, IncomingMessage } from "http";
import { apiKubePrefix } from "../../common/vars";
import contentSecurityPolicyInjectable from "../../common/vars/content-security-policy.injectable";
import type { ClusterContextHandler } from "../context-handler/context-handler";
import routeRequestInjectable from "../router/route-request.injectable";
import { getBoolean } from "../utils/parse-query";
import getClusterForRequestInjectable from "./get-cluster-for-request.injectable";
import type HttpProxyServer from "http-proxy";

const watchParam = "watch";
const followParam = "follow";

const isLongRunningRequest = (reqUrl: string) => {
  const url = new URL(reqUrl, "http://localhost");

  return getBoolean(url.searchParams, watchParam) || getBoolean(url.searchParams, followParam);
};

export type HandleRequest = (req: IncomingMessage, res: ServerResponse) => Promise<void>;
export type HandleRequestFor = (proxy: HttpProxyServer) => HandleRequest;

const handleRequestForInjectable = getInjectable({
  id: "handle-request-for",
  instantiate: (di): HandleRequestFor => {
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);
    const contentSecurityPolicy = di.inject(contentSecurityPolicyInjectable);
    const routeRequest = di.inject(routeRequestInjectable);

    const getProxyTarget = async (req: IncomingMessage, contextHandler: ClusterContextHandler) => {
      if (req.url?.startsWith(apiKubePrefix)) {
        delete req.headers.authorization;
        req.url = req.url.replace(apiKubePrefix, "");

        return contextHandler.getApiTarget(isLongRunningRequest(req.url));
      }

      return undefined;
    };

    return (proxy) => async (req, res) => {
      const cluster = getClusterForRequest(req);

      if (cluster) {
        const proxyTarget = await getProxyTarget(req, cluster.contextHandler);

        if (proxyTarget) {
          return proxy.web(req, res, proxyTarget);
        }
      }

      res.setHeader("Content-Security-Policy", contentSecurityPolicy);
      await routeRequest(cluster, req, res);
    };
  },
});

export default handleRequestForInjectable;

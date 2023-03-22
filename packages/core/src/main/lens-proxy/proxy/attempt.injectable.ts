/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ServerResponse } from "http";
import type { Cluster } from "../../../common/cluster/cluster";
import { apiKubePrefix } from "../../../common/vars";
import kubeAuthProxyServerInjectable from "../../cluster/kube-auth-proxy-server.injectable";
import { isLongRunningRequest } from "../helpers";
import type { ProxyIncomingMessage } from "../messages";
import rawHttpProxyInjectable from "./raw-proxy.injectable";

export type ProxyReqToCluster = (cluster: Cluster, req: ProxyIncomingMessage, res: ServerResponse) => Promise<void>;

const proxyReqToClusterInjectable = getInjectable({
  id: "proxy-req-to-cluster",
  instantiate: (di): ProxyReqToCluster => {
    const proxy = di.inject(rawHttpProxyInjectable);

    return async (cluster, req, res) => {
      delete req.headers.authorization;
      req.url = req.url.replace(apiKubePrefix, "");

      const kubeAuthProxyServer = di.inject(kubeAuthProxyServerInjectable, cluster);
      const proxyTarget = await kubeAuthProxyServer.getApiTarget(isLongRunningRequest(req.url));

      proxy.web(req, res, proxyTarget);
    };
  },
  causesSideEffects: true,
});

export default proxyReqToClusterInjectable;

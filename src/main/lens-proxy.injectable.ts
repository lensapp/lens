/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProxy } from "./lens-proxy";
import { kubeApiUpgradeRequest } from "./proxy-functions";
import routerInjectable from "./router/router.injectable";
import httpProxy from "http-proxy";
import clusterManagerInjectable from "./cluster-manager.injectable";
import shellApiRequestInjectable from "./proxy-functions/shell-api-request/shell-api-request.injectable";
import lensProxyPortNumberStateInjectable from "./lens-proxy-port-number-state.injectable";

const lensProxyInjectable = getInjectable({
  id: "lens-proxy",

  instantiate: (di) => {
    const clusterManager = di.inject(clusterManagerInjectable);
    const router = di.inject(routerInjectable);
    const shellApiRequest = di.inject(shellApiRequestInjectable);
    const proxy = httpProxy.createProxy();
    const lensProxyPortNumberState = di.inject(lensProxyPortNumberStateInjectable);

    return new LensProxy({
      router,
      proxy,
      kubeApiUpgradeRequest,
      shellApiRequest,
      getClusterForRequest: clusterManager.getClusterForRequest,
      lensProxyPortNumberState,
    });
  },
});

export default lensProxyInjectable;

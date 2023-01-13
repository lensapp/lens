/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Router } from "@hapi/call";
import { getInjectable } from "@ogre-tools/injectable";
import type { Socket } from "net";
import loggerInjectable from "../../../common/logger.injectable";
import getClusterForRequestInjectable from "../get-cluster-for-request.injectable";
import type { LensProxyRequest, LensProxyUpgradeRequestHandler } from "./proxy-upgrade-route";
import { lensProxyUpgradeRouteInjectionToken } from "./proxy-upgrade-route";

export type RouteUpgradeRequest = (req: LensProxyRequest, socket: Socket, head: Buffer) => Promise<void>;

const routeUpgradeRequestInjectable = getInjectable({
  id: "route-upgrade-request",
  instantiate: (di): RouteUpgradeRequest => {
    const routes = di.injectMany(lensProxyUpgradeRouteInjectionToken);
    const logger = di.inject(loggerInjectable);
    const getClusterForRequest = di.inject(getClusterForRequestInjectable);

    const router = new Router<LensProxyUpgradeRequestHandler>();

    for (const route of routes) {
      router.add({ method: "get", path: route.path }, route.handler);
    }

    return async (req, socket, head) => {
      const cluster = getClusterForRequest(req);
      const url = new URL(req.url, "https://localhost");

      if (!cluster) {
        logger.error(`[LENS-PROXY]: Could not find cluster for upgrade request from url=${req.url}`);
        socket.destroy();

        return;
      }

      const matchingRoute = router.route("get", url.pathname);

      if (matchingRoute instanceof Error) {
        logger.warn(`[LENS-PROXY]: no matching upgrade route found for url=${req.url}`);

        return;
      }

      try {
        await matchingRoute.route({ cluster, head, req, socket });
      } catch (error) {
        logger.error("[LENS-PROXY]: failed to handle proxy upgrade", error);
      }
    };
  },
});

export default routeUpgradeRequestInjectable;

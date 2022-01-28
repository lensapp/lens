/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { Router } from "./router";
import routePortForwardInjectable from "../routes/port-forward/route-port-forward/route-port-forward.injectable";
import { apiPrefix } from "../../common/vars";
import metricsRouteInjectable from "../routes/metrics/route.injectable";

const routerInjectable = getInjectable({
  instantiate: (di) => {
    const router = new Router();
    const routePortForward = di.inject(routePortForwardInjectable);

    router.addRoute("post", `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`, routePortForward);

    // Metrics API
    const { routeMetrics, routeMetricsProviders } = di.inject(metricsRouteInjectable);

    router.addRoute("post", `${apiPrefix}/metrics`, routeMetrics);
    router.addRoute("get", `${apiPrefix}/metrics/providers`, routeMetricsProviders);

    return router;
  },

  lifecycle: lifecycleEnum.singleton,
});

export default routerInjectable;

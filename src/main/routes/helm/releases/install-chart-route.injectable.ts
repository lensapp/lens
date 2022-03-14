/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { Route } from "../../../router/router";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";

interface InstallChartResponse {
  log: string;
  release: { name: string; namespace: string };
}

const installChartRouteInjectable = getInjectable({
  id: "install-chart-route",

  instantiate: () : Route<InstallChartResponse> => ({
    method: "post",
    path: `${apiPrefix}/v2/releases`,

    handler: async (request) => {
      const { payload, cluster } = request;

      return {
        response: await helmService.installChart(cluster, payload),
        statusCode: 201,
      };
    },
  }),

  injectionToken: routeInjectionToken,
});

export default installChartRouteInjectable;

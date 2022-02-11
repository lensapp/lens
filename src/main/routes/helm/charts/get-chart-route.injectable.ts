/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../../router/router.injectable";
import type { LensApiRequest } from "../../../router";
import { helmService } from "../../../helm/helm-service";
import { respondJson, respondText } from "../../../utils/http-responses";
import { apiPrefix } from "../../../../common/vars";

const getChartRouteInjectable = getInjectable({
  id: "get-chart-route",

  instantiate: () => ({
    method: "get",
    path: `${apiPrefix}/v2/charts/{repo}/{chart}`,

    handler: async (request: LensApiRequest) => {
      const { params, query, response } = request;

      try {
        const chart = await helmService.getChart(params.repo, params.chart, query.get("version"));

        respondJson(response, chart);
      } catch (error) {
        respondText(response, error?.toString() || "Error getting chart", 422);
      }
    },
  }),

  injectionToken: routeInjectionToken,
});

export default getChartRouteInjectable;

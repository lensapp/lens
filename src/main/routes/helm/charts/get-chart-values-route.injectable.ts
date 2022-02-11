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

const getChartRouteValuesInjectable = getInjectable({
  id: "get-chart-route-values",

  instantiate: () => ({
    method: "get",
    path: `${apiPrefix}/v2/charts/{repo}/{chart}/values`,

    handler: async (request: LensApiRequest) => {
      const { params, query, response } = request;

      try {
        const values = await helmService.getChartValues(params.repo, params.chart, query.get("version"));

        respondJson(response, values);
      } catch (error) {
        respondText(response, error?.toString() || "Error getting chart values", 422);
      }
    },
  }),

  injectionToken: routeInjectionToken,
});

export default getChartRouteValuesInjectable;

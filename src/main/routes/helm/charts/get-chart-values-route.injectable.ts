/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../../router/router.injectable";
import type { LensApiRequest, LensApiResult } from "../../../router";
import { helmService } from "../../../helm/helm-service";
import { apiPrefix } from "../../../../common/vars";

const getChartRouteValuesInjectable = getInjectable({
  id: "get-chart-route-values",

  instantiate: () => ({
    method: "get",
    path: `${apiPrefix}/v2/charts/{repo}/{chart}/values`,

    handler: async ({
      params,
      query,
    }: LensApiRequest): Promise<LensApiResult> => ({
      response: await helmService.getChartValues(
        params.repo,
        params.chart,
        query.get("version"),
      ),
    }),
  }),

  injectionToken: routeInjectionToken,
});

export default getChartRouteValuesInjectable;

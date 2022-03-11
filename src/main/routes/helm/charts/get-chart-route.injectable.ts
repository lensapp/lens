/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../../router/router.injectable";
import type { Route } from "../../../router/router";
import { helmService } from "../../../helm/helm-service";
import { apiPrefix } from "../../../../common/vars";
import type { RawHelmChart } from "../../../../common/k8s-api/endpoints/helm-charts.api";

interface GetChartResponse {
  readme: string;
  versions: RawHelmChart[];
}

const getChartRouteInjectable = getInjectable({
  id: "get-chart-route",

  instantiate: (): Route<GetChartResponse> => ({
    method: "get",
    path: `${apiPrefix}/v2/charts/{repo}/{chart}`,

    handler: async ({ params, query }) => ({
      response: await helmService.getChart(
        params.repo,
        params.chart,
        query.get("version"),
      ),
    }),
  }),

  injectionToken: routeInjectionToken,
});

export default getChartRouteInjectable;

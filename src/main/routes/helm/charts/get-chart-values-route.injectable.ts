/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../../router/router.injectable";
import { helmService } from "../../../helm/helm-service";
import { apiPrefix } from "../../../../common/vars";
import { route } from "../../../router/route";

const getChartRouteValuesInjectable = getRouteInjectable({
  id: "get-chart-route-values",

  instantiate: () => route({
    method: "get",
    path: `${apiPrefix}/v2/charts/{repo}/{chart}/values`,
  })(async ({ params, query }) => ({
    response: await helmService.getChartValues(
      params.repo,
      params.chart,
      query.get("version") ?? undefined,
    ),
  })),
});

export default getChartRouteValuesInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../../router/router.injectable";
import { apiPrefix } from "../../../../common/vars";
import { route } from "../../../router/route";
import { helmService } from "../../../helm/helm-service";

const getChartRouteInjectable = getRouteInjectable({
  id: "get-chart-route",

  instantiate: () => route({
    method: "get",
    path: `${apiPrefix}/v2/charts/{repo}/{chart}`,
  })(async ({ params, query }) => {
    const { repo, chart } = params;

    return {
      response: await helmService.getChart(
        repo,
        chart,
        query.get("version") ?? undefined,
      ),
    };
  }),
});

export default getChartRouteInjectable;

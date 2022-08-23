/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../../router/router.injectable";
import { apiPrefix } from "../../../../common/vars";
import { route } from "../../../router/route";
import getHelmChartInjectable from "../../../helm/helm-service/get-helm-chart.injectable";

const getChartRouteInjectable = getRouteInjectable({
  id: "get-chart-route",

  instantiate: (di) => {
    const getHelmChart = di.inject(getHelmChartInjectable);

    return route({
      method: "get",
      path: `${apiPrefix}/v2/charts/{repo}/{chart}`,
    })(async ({ params, query }) => {
      const { repo, chart } = params;

      return {
        response: await getHelmChart(
          repo,
          chart,
          query.get("version") ?? undefined,
        ),
      };
    });
  },
});

export default getChartRouteInjectable;

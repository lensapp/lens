/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../../router/router.injectable";
import { apiPrefix } from "../../../../common/vars";
import { route } from "../../../router/route";
import getHelmChartValuesInjectable from "../../../helm/helm-service/get-helm-chart-values.injectable";

const getHelmChartRouteValuesInjectable = getRouteInjectable({
  id: "get-helm-chart-values-route",

  instantiate: (di) => {
    const getHelmChartValues = di.inject(getHelmChartValuesInjectable);

    return route({
      method: "get",
      path: `${apiPrefix}/v2/charts/{repo}/{chart}/values`,
    })(async ({ params, query }) => ({
      response: await getHelmChartValues(
        params.repo,
        params.chart,
        query.get("version") ?? undefined,
      ),
    }));
  },
});

export default getHelmChartRouteValuesInjectable;

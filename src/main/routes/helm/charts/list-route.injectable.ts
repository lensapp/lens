/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../../router/router.injectable";
import { apiPrefix } from "../../../../common/vars";
import { route } from "../../../router/route";
import listHelmChartsInjectable from "../../../helm/helm-service/list-helm-charts.injectable";

const listHelmChartsRouteInjectable = getRouteInjectable({
  id: "list-helm-charts-route",

  instantiate: (di) => {
    const listHelmCharts = di.inject(listHelmChartsInjectable);

    return route({
      method: "get",
      path: `${apiPrefix}/v2/charts`,
    })(async () => ({
      response: await listHelmCharts(),
    }));
  },
});

export default listHelmChartsRouteInjectable;

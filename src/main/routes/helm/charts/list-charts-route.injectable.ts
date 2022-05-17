/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteInjectable } from "../../../router/router.injectable";
import { helmService } from "../../../helm/helm-service";
import { apiPrefix } from "../../../../common/vars";
import { route } from "../../../router/route";

const listChartsRouteInjectable = getRouteInjectable({
  id: "list-charts-route",

  instantiate: () => route({
    method: "get",
    path: `${apiPrefix}/v2/charts`,
  })(async () => ({
    response: await helmService.listCharts(),
  })),
});

export default listChartsRouteInjectable;

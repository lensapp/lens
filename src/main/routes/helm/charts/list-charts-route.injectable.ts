/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../../router/router.injectable";
import type { Route } from "../../../router/router";
import { helmService } from "../../../helm/helm-service";
import { apiPrefix } from "../../../../common/vars";

const listChartsRouteInjectable = getInjectable({
  id: "list-charts-route",

  instantiate: (): Route<any> => ({
    method: "get",
    path: `${apiPrefix}/v2/charts`,

    handler: async () => ({
      response: await helmService.listCharts(),
    }),
  }),

  injectionToken: routeInjectionToken,
});

export default listChartsRouteInjectable;

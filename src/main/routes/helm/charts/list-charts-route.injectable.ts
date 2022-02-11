/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../../router/router.injectable";
import type { LensApiRequest } from "../../../router";
import { helmService } from "../../../helm/helm-service";
import { respondJson } from "../../../utils/http-responses";
import { apiPrefix } from "../../../../common/vars";

const listChartsRouteInjectable = getInjectable({
  id: "list-charts-route",

  instantiate: () => ({
    method: "get",
    path: `${apiPrefix}/v2/charts`,

    handler: async (request: LensApiRequest) => {
      const { response } = request;
      const charts = await helmService.listCharts();

      respondJson(response, charts);
    },
  }),

  injectionToken: routeInjectionToken,
});

export default listChartsRouteInjectable;

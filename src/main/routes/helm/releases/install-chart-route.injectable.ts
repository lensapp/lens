/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { LensApiRequest } from "../../../router";
import { helmService } from "../../../helm/helm-service";
import { respondJson, respondText } from "../../../utils/http-responses";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import logger from "../../../logger";

const installChartRouteInjectable = getInjectable({
  id: "install-chart-route",

  instantiate: () => ({
    method: "post",
    path: `${apiPrefix}/v2/releases`,

    handler: async (request: LensApiRequest) => {
      const { payload, cluster, response } = request;

      try {
        const result = await helmService.installChart(cluster, payload);

        respondJson(response, result, 201);
      } catch (error) {
        logger.debug(error);
        respondText(response, error?.toString() || "Error installing chart", 422);
      }
    },
  }),

  injectionToken: routeInjectionToken,
});

export default installChartRouteInjectable;

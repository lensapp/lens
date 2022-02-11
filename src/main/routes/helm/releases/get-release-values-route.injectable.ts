/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { LensApiRequest } from "../../../router";
import { helmService } from "../../../helm/helm-service";
import { respondText } from "../../../utils/http-responses";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import logger from "../../../logger";
import { getBoolean } from "../../../utils/parse-query";

const getReleaseRouteValuesInjectable = getInjectable({
  id: "get-release-values-route",

  instantiate: () => ({
    method: "get",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}/values`,

    handler: async (request: LensApiRequest) => {
      const { cluster, params: { namespace, release }, response, query } = request;
      const all = getBoolean(query, "all");

      try {
        const result = await helmService.getReleaseValues(release, { cluster, namespace, all });

        respondText(response, result);
      } catch (error) {
        logger.debug(error);
        respondText(response, error?.toString() || "Error getting release values", 422);
      }
    },
  }),

  injectionToken: routeInjectionToken,
});

export default getReleaseRouteValuesInjectable;

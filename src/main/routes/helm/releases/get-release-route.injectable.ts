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

const getReleaseRouteInjectable = getInjectable({
  id: "get-release-route",

  instantiate: () => ({
    method: "get",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}`,

    handler: async (request: LensApiRequest) => {
      const { cluster, params, response } = request;

      try {
        const result = await helmService.getRelease(cluster, params.release, params.namespace);

        respondJson(response, result);
      } catch (error) {
        logger.debug(error);
        respondText(response, error?.toString() || "Error getting release", 422);
      }
    },
  }),

  injectionToken: routeInjectionToken,
});

export default getReleaseRouteInjectable;

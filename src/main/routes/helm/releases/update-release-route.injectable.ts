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

const updateReleaseRouteInjectable = getInjectable({
  id: "update-release-route",

  instantiate: () => ({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}`,

    handler: async (request: LensApiRequest) => {
      const { cluster, params, payload, response } = request;

      try {
        const result = await helmService.updateRelease(cluster, params.release, params.namespace, payload );

        respondJson(response, result);
      } catch (error) {
        logger.debug(error);
        respondText(response, error?.toString() || "Error updating chart", 422);
      }
    },
  }),

  injectionToken: routeInjectionToken,
});

export default updateReleaseRouteInjectable;

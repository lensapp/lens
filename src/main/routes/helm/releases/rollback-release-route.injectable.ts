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

const rollbackReleaseRouteInjectable = getInjectable({
  id: "rollback-release-route",

  instantiate: () => ({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}/rollback`,

    handler: async (request: LensApiRequest) => {
      const { cluster, params, payload, response } = request;

      try {
        await helmService.rollback(cluster, params.release, params.namespace, payload.revision);

        response.end();
      } catch (error) {
        logger.debug(error);
        respondText(response, error?.toString() || "Error rolling back chart", 422);
      }
    },
  }),

  injectionToken: routeInjectionToken,
});

export default rollbackReleaseRouteInjectable;

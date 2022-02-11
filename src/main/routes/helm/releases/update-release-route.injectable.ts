/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { LensApiRequest, LensApiResult } from "../../../router";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";

const updateReleaseRouteInjectable = getInjectable({
  id: "update-release-route",

  instantiate: () => ({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}`,

    handler: async ({
      cluster,
      params,
      payload,
    }: LensApiRequest): Promise<LensApiResult> => ({
      response: await helmService.updateRelease(
        cluster,
        params.release,
        params.namespace,
        payload,
      ),
    }),
  }),

  injectionToken: routeInjectionToken,
});

export default updateReleaseRouteInjectable;

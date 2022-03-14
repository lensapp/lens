/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { Route } from "../../../router/router";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";

interface UpdateReleaseResponse {
  log: string;
  release: { name: string; namespace: string };
}

const updateReleaseRouteInjectable = getInjectable({
  id: "update-release-route",

  instantiate: (): Route<UpdateReleaseResponse> => ({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}`,

    handler: async ({
      cluster,
      params,
      payload,
    }) => ({
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

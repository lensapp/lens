/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensApiRequest } from "../../router";
import { respondJson } from "../../utils/http-responses";
import { routeInjectionToken } from "../../router/router.injectable";
import { getAppVersion } from "../../../common/utils";

const getVersionRouteInjectable = getInjectable({
  id: "get-version-route",

  instantiate: () => ({
    method: "get",
    path: `/version`,

    handler: async (request: LensApiRequest) => {
      const { response } = request;

      respondJson(response, { version: getAppVersion() }, 200);
    },
  }),

  injectionToken: routeInjectionToken,
});

export default getVersionRouteInjectable;

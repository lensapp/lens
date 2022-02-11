/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensApiRequest, LensApiResult } from "../../router";
import { routeInjectionToken } from "../../router/router.injectable";
import { getAppVersion } from "../../../common/utils";

const getVersionRouteInjectable = getInjectable({
  id: "get-version-route",

  instantiate: () => ({
    method: "get",
    path: `/version`,

    // eslint-disable-next-line unused-imports/no-unused-vars-ts
    handler: async (request: LensApiRequest): Promise<LensApiResult> => {
      return { response: { version: getAppVersion() }};
    },
  }),

  injectionToken: routeInjectionToken,
});

export default getVersionRouteInjectable;

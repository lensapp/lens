/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Route } from "../../router/router";
import { routeInjectionToken } from "../../router/router.injectable";
import { getAppVersion } from "../../../common/utils";

const getVersionRouteInjectable = getInjectable({
  id: "get-version-route",

  instantiate: (): Route<{ version: string }> => ({
    method: "get",
    path: `/version`,

    handler: () => ({ response: { version: getAppVersion() }}),
  }),

  injectionToken: routeInjectionToken,
});

export default getVersionRouteInjectable;

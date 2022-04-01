/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import proxyPreferencesRouteInjectable from "./proxy-preferences-route.injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";

const navigateToProxyPreferencesInjectable = getInjectable({
  id: "navigate-to-proxy-preferences",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(proxyPreferencesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToProxyPreferencesInjectable;

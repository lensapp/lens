/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appPreferencesRouteInjectable from "./app-preferences-route.injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";

const navigateToAppPreferencesInjectable = getInjectable({
  id: "navigate-to-app-preferences",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(appPreferencesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToAppPreferencesInjectable;

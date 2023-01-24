/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../../common/front-end-routing/navigate-to-route-injection-token";
import preferencesRouteInjectable from "./preferences-route.injectable";

const navigateToPreferencesInjectable = getInjectable({
  id: "navigate-to-preferences",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const preferencesRoute = di.inject(preferencesRouteInjectable);

    return (tabId?: string) =>
      navigateToRoute(preferencesRoute, {
        parameters: tabId ? { preferenceTabId: tabId } : {},
      });
  },
});

export default navigateToPreferencesInjectable;

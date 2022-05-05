/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionPreferencesRouteInjectable from "./extension-preferences-route.injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";

const navigateToExtensionPreferencesInjectable = getInjectable({
  id: "navigate-to-extension-preferences",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(extensionPreferencesRouteInjectable);

    return (extensionId: string, tabId?: string) => navigateToRoute(route, { parameters: {
      extensionId,
      tabId,
    }});
  },
});

export default navigateToExtensionPreferencesInjectable;

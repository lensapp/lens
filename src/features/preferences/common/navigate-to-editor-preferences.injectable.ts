/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import preferencesRouteInjectable from "./preferences-route.injectable";
import { navigateToRouteInjectionToken } from "../../../common/front-end-routing/navigate-to-route-injection-token";

const navigateToEditorPreferencesInjectable = getInjectable({
  id: "navigate-to-editor-preferences",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(preferencesRouteInjectable);

    return () => navigateToRoute(route, { parameters: { preferenceTabId: "editor" }});
  },
});

export default navigateToEditorPreferencesInjectable;

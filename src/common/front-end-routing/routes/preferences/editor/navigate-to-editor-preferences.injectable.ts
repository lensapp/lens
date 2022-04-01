/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import editorPreferencesRouteInjectable from "./editor-preferences-route.injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";

const navigateToEditorPreferencesInjectable = getInjectable({
  id: "navigate-to-editor-preferences",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(editorPreferencesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToEditorPreferencesInjectable;

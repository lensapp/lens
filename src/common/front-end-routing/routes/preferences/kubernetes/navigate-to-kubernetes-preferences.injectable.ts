/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import kubernetesPreferencesRouteInjectable from "./kubernetes-preferences-route.injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";

const navigateToKubernetesPreferencesInjectable = getInjectable({
  id: "navigate-to-kubernetes-preferences",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(kubernetesPreferencesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToKubernetesPreferencesInjectable;

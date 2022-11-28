/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import runtimeClassesRouteInjectable from "./runtime-classes-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToRuntimeClassesInjectable = getInjectable({
  id: "navigate-to-runtime-classes",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(runtimeClassesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToRuntimeClassesInjectable;

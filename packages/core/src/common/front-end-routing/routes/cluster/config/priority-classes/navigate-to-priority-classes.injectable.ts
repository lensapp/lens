/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import priorityClassesRouteInjectable from "./priority-classes-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToPriorityClassesInjectable = getInjectable({
  id: "navigate-to-priority-classes",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(priorityClassesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToPriorityClassesInjectable;

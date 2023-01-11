/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import storageClassesRouteInjectable from "./storage-classes-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToStorageClassesInjectable = getInjectable({
  id: "navigate-to-storage-classes",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(storageClassesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToStorageClassesInjectable;

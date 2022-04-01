/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import persistentVolumesRouteInjectable from "./persistent-volumes-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToPersistentVolumesInjectable = getInjectable({
  id: "navigate-to-persistent-volumes",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(persistentVolumesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToPersistentVolumesInjectable;

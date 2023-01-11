/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import persistentVolumeClaimsRouteInjectable from "./persistent-volume-claims-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToPersistentVolumeClaimsInjectable = getInjectable({
  id: "navigate-to-persistent-volume-claims",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(persistentVolumeClaimsRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToPersistentVolumeClaimsInjectable;

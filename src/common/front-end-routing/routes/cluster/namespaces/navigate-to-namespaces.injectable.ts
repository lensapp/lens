/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import namespacesRouteInjectable from "./namespaces-route.injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";

const navigateToNamespacesInjectable = getInjectable({
  id: "navigate-to-namespaces",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(namespacesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToNamespacesInjectable;

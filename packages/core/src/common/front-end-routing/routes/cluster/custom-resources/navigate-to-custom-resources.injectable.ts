/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";
import type { CustomResourcesPathParameters } from "./custom-resources-route.injectable";
import customResourcesRouteInjectable from "./custom-resources-route.injectable";

const navigateToCustomResourcesInjectable = getInjectable({
  id: "navigate-to-custom-resources",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(customResourcesRouteInjectable);

    return (parameters?: CustomResourcesPathParameters) => navigateToRoute(route, { parameters });
  },
});

export default navigateToCustomResourcesInjectable;

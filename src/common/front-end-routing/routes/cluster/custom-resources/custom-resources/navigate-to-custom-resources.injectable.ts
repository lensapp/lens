/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import customResourcesRouteInjectable, { CustomResourcesPathParameters } from "./custom-resources-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToCustomResourcesInjectable = getInjectable({
  id: "navigate-to-custom-resources",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(customResourcesRouteInjectable);

    return (parameters?: CustomResourcesPathParameters) =>
      navigateToRoute(route, { parameters });
  },
});

export default navigateToCustomResourcesInjectable;

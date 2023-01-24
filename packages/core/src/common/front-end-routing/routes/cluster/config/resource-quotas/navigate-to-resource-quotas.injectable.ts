/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import resourceQuotasRouteInjectable from "./resource-quotas-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToResourceQuotasInjectable = getInjectable({
  id: "navigate-to-resource-quotas",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(resourceQuotasRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToResourceQuotasInjectable;

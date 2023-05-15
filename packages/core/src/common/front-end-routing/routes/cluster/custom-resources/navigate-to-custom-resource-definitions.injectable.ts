/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { navigateToRouteInjectionToken } from "../../../navigate-to-route-injection-token";
import crdListRouteInjectable from "./custom-resource-definitions.injectable";

const navigateToCustomResourceDefinitionsInjectable = getInjectable({
  id: "navigate-to-custom-resource-definitions",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(crdListRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToCustomResourceDefinitionsInjectable;

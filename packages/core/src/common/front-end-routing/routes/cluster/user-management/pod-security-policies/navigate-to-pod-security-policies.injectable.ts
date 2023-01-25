/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import podSecurityPoliciesRouteInjectable from "./pod-security-policies-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToPodSecurityPoliciesInjectable = getInjectable({
  id: "navigate-to-pod-security-policies",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(podSecurityPoliciesRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToPodSecurityPoliciesInjectable;

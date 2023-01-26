/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import verticalPodAutoscalersRouteInjectable from "./vertical-pod-autoscalers-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToVerticalPodAutoscalersInjectable = getInjectable({
  id: "navigate-to-vertical-pod-autoscalers",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(verticalPodAutoscalersRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToVerticalPodAutoscalersInjectable;

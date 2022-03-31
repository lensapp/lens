/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import horizontalPodAutoscalersRouteInjectable from "./horizontal-pod-autoscalers-route.injectable";
import { navigateToRouteInjectionToken } from "../../../../navigate-to-route-injection-token";

const navigateToHorizontalPodAutoscalersInjectable = getInjectable({
  id: "navigate-to-horizontal-pod-autoscalers",

  instantiate: (di) => {
    const navigateToRoute = di.inject(navigateToRouteInjectionToken);
    const route = di.inject(horizontalPodAutoscalersRouteInjectable);

    return () => navigateToRoute(route);
  },
});

export default navigateToHorizontalPodAutoscalersInjectable;

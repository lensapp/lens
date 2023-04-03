/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const horizontalPodAutoscalersRouteInjectable = getInjectable({
  id: "horizontal-pod-autoscalers-route",

  instantiate: (di) => ({
    path: "/hpa",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "horizontalpodautoscalers",
      group: "autoscaling",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default horizontalPodAutoscalersRouteInjectable;

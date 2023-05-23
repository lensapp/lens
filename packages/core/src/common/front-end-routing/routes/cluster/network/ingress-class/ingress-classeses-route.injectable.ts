/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";
import {
  shouldShowResourceInjectionToken,
} from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";

const ingressClassesesRouteInjectable = getInjectable({
  id: "ingress-classes-route",

  instantiate: (di) => {
    const isEnabled = di.inject(shouldShowResourceInjectionToken, {
      apiName: "ingressclasses",
      group: "networking.k8s.io",
    });

    return {
      path: "/ingress-classes",
      clusterFrame: true,
      isEnabled,
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default ingressClassesesRouteInjectable;

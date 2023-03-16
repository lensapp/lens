/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const networkPoliciesRouteInjectable = getInjectable({
  id: "network-policies-route",

  instantiate: (di) => ({
    path: "/network-policies",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "networkpolicies",
      group: "networking.k8s.io",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default networkPoliciesRouteInjectable;

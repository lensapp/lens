/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const podSecurityPoliciesRouteInjectable = getInjectable({
  id: "pod-security-policies-route",

  instantiate: (di) => {
    return {
      path: "/pod-security-policies",
      clusterFrame: true,
      isEnabled: di.inject(shouldShowResourceInjectionToken, {
        apiName: "podsecuritypolicies",
        group: "policy",
      }),
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default podSecurityPoliciesRouteInjectable;

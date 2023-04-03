/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const roleBindingsRouteInjectable = getInjectable({
  id: "role-bindings-route",

  instantiate: (di) => {
    return {
      path: "/role-bindings",
      clusterFrame: true,
      isEnabled: di.inject(shouldShowResourceInjectionToken, {
        apiName: "rolebindings",
        group: "rbac.authorization.k8s.io",
      }),
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default roleBindingsRouteInjectable;

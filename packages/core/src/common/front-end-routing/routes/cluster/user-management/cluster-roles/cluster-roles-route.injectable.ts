/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const clusterRolesRouteInjectable = getInjectable({
  id: "cluster-roles-route",

  instantiate: (di) => ({
    path: "/cluster-roles",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "clusterroles",
      group: "rbac.authorization.k8s.io",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default clusterRolesRouteInjectable;

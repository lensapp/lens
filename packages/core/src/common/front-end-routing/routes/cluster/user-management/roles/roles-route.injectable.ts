/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { shouldShowResourceInjectionToken } from "../../../../../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const rolesRouteInjectable = getInjectable({
  id: "roles-route",

  instantiate: (di) => ({
    path: "/roles",
    clusterFrame: true,
    isEnabled: di.inject(shouldShowResourceInjectionToken, {
      apiName: "roles",
      group: "rbac.authorization.k8s.io",
    }),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default rolesRouteInjectable;

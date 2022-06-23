/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isAllowedResourceInjectable from "../../../../../utils/is-allowed-resource.injectable";
import { frontEndRouteInjectionToken } from "../../../../front-end-route-injection-token";

const clusterRoleBindingsRouteInjectable = getInjectable({
  id: "cluster-role-bindings-route",

  instantiate: (di) => {
    const isAllowedResource = di.inject(isAllowedResourceInjectable, "clusterrolebindings");

    return {
      path: "/cluster-role-bindings",
      clusterFrame: true,
      isEnabled: isAllowedResource,
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default clusterRoleBindingsRouteInjectable;

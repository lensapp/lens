/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import navigateToAddClusterInjectable from "../../../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";
import { internalDeepLinkingRouteInjectionToken } from "../common/internal-handler-token";

const addClusterDeepLinkingHandlerInjectable = getInjectable({
  id: "add-cluster-deep-linking-handler",
  instantiate: (di) => {
    const navigateToAddCluster = di.inject(navigateToAddClusterInjectable);

    return {
      path: "/cluster",
      handler: () => navigateToAddCluster(),
    };
  },
  injectionToken: internalDeepLinkingRouteInjectionToken,
});

export default addClusterDeepLinkingHandlerInjectable;

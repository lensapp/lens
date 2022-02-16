/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import deploymentsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/deployments/deployments-route.injectable";
import { workloadsSidebarItemId } from "../+workloads/workloads-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToDeploymentsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/deployments/navigate-to-deployments.injectable";

const deploymentsSidebarItemsInjectable = getInjectable({
  id: "deployments-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(deploymentsRouteInjectable);
    const navigateToDeployments = di.inject(navigateToDeploymentsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "deployments",
        parentId: workloadsSidebarItemId,
        title: "Deployments",
        onClick: navigateToDeployments,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 30,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default deploymentsSidebarItemsInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import deploymentsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/deployments/deployments-route.injectable";
import workloadsSidebarItemInjectable from "../workloads/workloads-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToDeploymentsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/deployments/navigate-to-deployments.injectable";

const deploymentsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-deployments",

  instantiate: (di) => {
    const route = di.inject(deploymentsRouteInjectable);

    return {
      parentId: workloadsSidebarItemInjectable.id,
      title: "Deployments",
      onClick: di.inject(navigateToDeploymentsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 30,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default deploymentsSidebarItemInjectable;

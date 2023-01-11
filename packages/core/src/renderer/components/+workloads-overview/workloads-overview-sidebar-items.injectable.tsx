/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import workloadsOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/overview/workloads-overview-route.injectable";
import { workloadsSidebarItemId } from "../+workloads/workloads-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToWorkloadsOverviewInjectable from "../../../common/front-end-routing/routes/cluster/workloads/overview/navigate-to-workloads-overview.injectable";

const workloadsOverviewSidebarItemsInjectable = getInjectable({
  id: "workloads-overview-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(workloadsOverviewRouteInjectable);
    const navigateToWorkloadsOverview = di.inject(navigateToWorkloadsOverviewInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "overview",
        parentId: workloadsSidebarItemId,
        title: "Overview",
        onClick: navigateToWorkloadsOverview,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 10,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default workloadsOverviewSidebarItemsInjectable;

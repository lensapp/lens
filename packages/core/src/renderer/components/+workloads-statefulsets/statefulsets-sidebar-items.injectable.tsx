/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import statefulsetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/statefulsets/statefulsets-route.injectable";
import { workloadsSidebarItemId } from "../+workloads/workloads-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToStatefulsetsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/statefulsets/navigate-to-statefulsets.injectable";

const statefulsetsSidebarItemsInjectable = getInjectable({
  id: "statefulsets-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(statefulsetsRouteInjectable);
    const navigateToStatefulsets = di.inject(navigateToStatefulsetsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "stateful-sets",
        parentId: workloadsSidebarItemId,
        title: "StatefulSets",
        onClick: navigateToStatefulsets,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 50,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default statefulsetsSidebarItemsInjectable;

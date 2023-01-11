/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import podsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/pods/pods-route.injectable";
import { workloadsSidebarItemId } from "../+workloads/workloads-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPodsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/pods/navigate-to-pods.injectable";

const podsSidebarItemsInjectable = getInjectable({
  id: "pods-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(podsRouteInjectable);
    const navigateToPods = di.inject(navigateToPodsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "pods",
        parentId: workloadsSidebarItemId,
        title: "Pods",
        onClick: navigateToPods,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 20,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default podsSidebarItemsInjectable;

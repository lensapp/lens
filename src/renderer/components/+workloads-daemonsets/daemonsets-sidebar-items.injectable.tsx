/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import daemonsetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/daemonsets/daemonsets-route.injectable";
import { workloadsSidebarItemId } from "../+workloads/workloads-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToDaemonsetsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/daemonsets/navigate-to-daemonsets.injectable";

const daemonsetsSidebarItemsInjectable = getInjectable({
  id: "daemonsets-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(daemonsetsRouteInjectable);
    const navigateToDaemonsets = di.inject(navigateToDaemonsetsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "daemon-sets",
        parentId: workloadsSidebarItemId,
        title: "DaemonSets",
        onClick: () => navigateToDaemonsets(),
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 40,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default daemonsetsSidebarItemsInjectable;

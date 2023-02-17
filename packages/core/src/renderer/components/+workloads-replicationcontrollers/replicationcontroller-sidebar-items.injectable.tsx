/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { workloadsSidebarItemId } from "../+workloads/workloads-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import replicationControllersRouteInjectable
  from "../../../common/front-end-routing/routes/cluster/workloads/replicationcontrollers/replicationcontrollers-route.injectable";
import navigateToReplicationControllersInjectable
  from "../../../common/front-end-routing/routes/cluster/workloads/replicationcontrollers/navigate-to-replication-controllers.injectable";

const replicationControllerSidebarItemsInjectable = getInjectable({
  id: "replicationctrl-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(replicationControllersRouteInjectable);
    const navigateToPage = di.inject(navigateToReplicationControllersInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "replication-controllers",
        parentId: workloadsSidebarItemId,
        title: "Replication Controllers",
        onClick: navigateToPage,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 61,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default replicationControllerSidebarItemsInjectable;

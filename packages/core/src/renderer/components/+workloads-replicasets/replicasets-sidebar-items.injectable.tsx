/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import replicasetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/replicasets/replicasets-route.injectable";
import { workloadsSidebarItemId } from "../+workloads/workloads-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToReplicasetsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/replicasets/navigate-to-replicasets.injectable";

const replicasetsSidebarItemsInjectable = getInjectable({
  id: "replicasets-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(replicasetsRouteInjectable);
    const navigateToReplicasets = di.inject(navigateToReplicasetsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "replica-sets",
        parentId: workloadsSidebarItemId,
        title: "ReplicaSets",
        onClick: navigateToReplicasets,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 60,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default replicasetsSidebarItemsInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import replicasetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/replicasets/replicasets-route.injectable";
import workloadsSidebarItemInjectable from "../workloads/workloads-sidebar-items.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToReplicasetsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/replicasets/navigate-to-replicasets.injectable";

const replicasetsSidebarItemInjectable = getInjectable({
  id: "replicasets-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(replicasetsRouteInjectable);

    return {
      id: "replica-sets",
      parentId: di.inject(workloadsSidebarItemInjectable).id,
      title: "ReplicaSets",
      onClick: di.inject(navigateToReplicasetsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 60,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default replicasetsSidebarItemInjectable;

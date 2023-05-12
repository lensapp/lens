/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import workloadsSidebarItemInjectable from "../workloads/workloads-sidebar-items.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import replicationControllersRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/replication-controllers/route.injectable";
import navigateToReplicationControllersInjectable from "../../../common/front-end-routing/routes/cluster/workloads/replication-controllers/navigate-to.injectable";

const replicationControllerSidebarItemInjectable = getInjectable({
  id: "replication-controller-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(replicationControllersRouteInjectable);

    return {
      id: "replication-controllers",
      parentId: di.inject(workloadsSidebarItemInjectable).id,
      title: "Replication Controllers",
      onClick: di.inject(navigateToReplicationControllersInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 61,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default replicationControllerSidebarItemInjectable;

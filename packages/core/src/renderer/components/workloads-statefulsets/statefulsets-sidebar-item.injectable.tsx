/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import statefulsetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/workloads/statefulsets/statefulsets-route.injectable";
import workloadsSidebarItemInjectable from "../workloads/workloads-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToStatefulsetsInjectable from "../../../common/front-end-routing/routes/cluster/workloads/statefulsets/navigate-to-statefulsets.injectable";

const statefulsetsSidebarItemInjectable = getInjectable({
  id: "statefulsets-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(statefulsetsRouteInjectable);

    return {
      id: "stateful-sets",
      parentId: di.inject(workloadsSidebarItemInjectable).id,
      title: "StatefulSets",
      onClick: di.inject(navigateToStatefulsetsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 50,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default statefulsetsSidebarItemInjectable;

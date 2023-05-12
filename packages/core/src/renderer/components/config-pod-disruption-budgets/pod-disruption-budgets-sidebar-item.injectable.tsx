/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import podDisruptionBudgetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/pod-disruption-budgets/pod-disruption-budgets-route.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPodDisruptionBudgetsInjectable from "../../../common/front-end-routing/routes/cluster/config/pod-disruption-budgets/navigate-to-pod-disruption-budgets.injectable";

const podDisruptionBudgetsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-pod-disruption-budgets",

  instantiate: (di) => {
    const route = di.inject(podDisruptionBudgetsRouteInjectable);

    return {
      parentId: configSidebarItemInjectable.id,
      title: "Pod Disruption Budgets",
      onClick: di.inject(navigateToPodDisruptionBudgetsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 60,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default podDisruptionBudgetsSidebarItemInjectable;

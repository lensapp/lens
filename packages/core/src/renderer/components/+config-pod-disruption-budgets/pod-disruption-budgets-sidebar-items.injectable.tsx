/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import podDisruptionBudgetsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/pod-disruption-budgets/pod-disruption-budgets-route.injectable";
import { configSidebarItemId } from "../+config/config-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPodDisruptionBudgetsInjectable from "../../../common/front-end-routing/routes/cluster/config/pod-disruption-budgets/navigate-to-pod-disruption-budgets.injectable";

const podDisruptionBudgetsSidebarItemsInjectable = getInjectable({
  id: "pod-disruption-budgets-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(podDisruptionBudgetsRouteInjectable);
    const navigateToPodDisruptionBudgets = di.inject(navigateToPodDisruptionBudgetsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "pod-disruption-budgets",
        parentId: configSidebarItemId,
        title: "Pod Disruption Budgets",
        onClick: navigateToPodDisruptionBudgets,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 60,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default podDisruptionBudgetsSidebarItemsInjectable;

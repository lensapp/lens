/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import verticalPodAutoscalersRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/vertical-pod-autoscalers/vertical-pod-autoscalers-route.injectable";
import { configSidebarItemId } from "../config/config-sidebar-items.injectable";
import type { SidebarItemRegistration } from "../layout/sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToVerticalPodAutoscalersInjectable from "../../../common/front-end-routing/routes/cluster/config/vertical-pod-autoscalers/navigate-to-vertical-pod-autoscalers.injectable";

const verticalPodAutoScalersSidebarItemsInjectable = getInjectable({
  id: "vertical-pod-auto-scalers-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(verticalPodAutoscalersRouteInjectable);
    const navigateToVerticalPodAutoscalers = di.inject(navigateToVerticalPodAutoscalersInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed((): SidebarItemRegistration[] => [
      {
        id: "vertical-pod-auto-scalers",
        parentId: configSidebarItemId,
        title: "VPA",
        onClick: navigateToVerticalPodAutoscalers,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 50,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default verticalPodAutoScalersSidebarItemsInjectable;

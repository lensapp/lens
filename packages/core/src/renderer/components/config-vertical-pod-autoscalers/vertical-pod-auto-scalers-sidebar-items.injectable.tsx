/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import verticalPodAutoscalersRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/vertical-pod-autoscalers/vertical-pod-autoscalers-route.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-items.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToVerticalPodAutoscalersInjectable from "../../../common/front-end-routing/routes/cluster/config/vertical-pod-autoscalers/navigate-to-vertical-pod-autoscalers.injectable";

const verticalPodAutoScalersSidebarItemInjectable = getInjectable({
  id: "vertical-pod-auto-scalers-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(verticalPodAutoscalersRouteInjectable);

    return {
      id: "vertical-pod-auto-scalers",
      parentId: di.inject(configSidebarItemInjectable).id,
      title: "VPA",
      onClick: di.inject(navigateToVerticalPodAutoscalersInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 50,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default verticalPodAutoScalersSidebarItemInjectable;

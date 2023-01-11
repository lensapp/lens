/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import helmChartsRouteInjectable from "../../../common/front-end-routing/routes/cluster/helm/charts/helm-charts-route.injectable";
import { helmSidebarItemId } from "../+helm/helm-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToHelmChartsInjectable from "../../../common/front-end-routing/routes/cluster/helm/charts/navigate-to-helm-charts.injectable";

const helmChartsSidebarItemsInjectable = getInjectable({
  id: "helm-charts-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(helmChartsRouteInjectable);
    const navigateToHelmCharts = di.inject(navigateToHelmChartsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "charts",
        parentId: helmSidebarItemId,
        title: "Charts",
        onClick: navigateToHelmCharts,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 10,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default helmChartsSidebarItemsInjectable;

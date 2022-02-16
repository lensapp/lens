/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Icon } from "../icon";
import React from "react";
import {
  SidebarItemRegistration,
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { computed } from "mobx";
import clusterOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/overview/cluster-overview-route.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToClusterOverviewInjectable from "../../../common/front-end-routing/routes/cluster/overview/navigate-to-cluster-overview.injectable";

const clusterOverviewSidebarItemsInjectable = getInjectable({
  id: "cluster-overview-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(clusterOverviewRouteInjectable);
    const navigateToClusterOverview = di.inject(navigateToClusterOverviewInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed((): SidebarItemRegistration[] => [
      {
        id: "cluster-overview",
        parentId: null,
        title: "Cluster",
        getIcon: () => <Icon svg="kube" />,
        onClick: navigateToClusterOverview,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 10,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default clusterOverviewSidebarItemsInjectable;

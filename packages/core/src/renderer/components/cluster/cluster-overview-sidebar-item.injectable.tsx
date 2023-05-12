/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Icon } from "@k8slens/icon";
import React from "react";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import clusterOverviewRouteInjectable from "../../../common/front-end-routing/routes/cluster/overview/cluster-overview-route.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToClusterOverviewInjectable from "../../../common/front-end-routing/routes/cluster/overview/navigate-to-cluster-overview.injectable";

const clusterOverviewSidebarItemInjectable = getInjectable({
  id: "sidebar-item-cluster-overview",

  instantiate: (di) => {
    const route = di.inject(clusterOverviewRouteInjectable);

    return {
      parentId: null,
      title: "Cluster",
      getIcon: () => <Icon svg="kube" />,
      onClick: di.inject(navigateToClusterOverviewInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 10,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default clusterOverviewSidebarItemInjectable;

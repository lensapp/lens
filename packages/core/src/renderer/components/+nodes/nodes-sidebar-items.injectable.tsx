/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type {
  SidebarItemRegistration } from "../layout/sidebar-items.injectable";
import {
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { Icon } from "../icon";
import React from "react";

import nodesRouteInjectable from "../../../common/front-end-routing/routes/cluster/nodes/nodes-route.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToNodesInjectable from "../../../common/front-end-routing/routes/cluster/nodes/navigate-to-nodes.injectable";

const nodesSidebarItemsInjectable = getInjectable({
  id: "nodes-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(nodesRouteInjectable);
    const navigateToNodes = di.inject(navigateToNodesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed((): SidebarItemRegistration[] => [
      {
        id: "nodes",
        parentId: null,
        getIcon: () => <Icon svg="nodes" />,
        title: "Nodes",
        onClick: navigateToNodes,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 20,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default nodesSidebarItemsInjectable;

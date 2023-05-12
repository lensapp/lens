/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { Icon } from "@k8slens/icon";
import React from "react";

import nodesRouteInjectable from "../../../common/front-end-routing/routes/cluster/nodes/nodes-route.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToNodesInjectable from "../../../common/front-end-routing/routes/cluster/nodes/navigate-to-nodes.injectable";

const nodesSidebarItemInjectable = getInjectable({
  id: "sidebar-item-nodes",

  instantiate: (di) => {
    const route = di.inject(nodesRouteInjectable);

    return {
      parentId: null,
      getIcon: () => <Icon svg="nodes" />,
      title: "Nodes",
      onClick: di.inject(navigateToNodesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 20,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default nodesSidebarItemInjectable;

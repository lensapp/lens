/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import portForwardsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/port-forwards/port-forwards-route.injectable";
import { networkSidebarItemId } from "../+network/network-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPortForwardsInjectable from "../../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";

const portForwardsSidebarItemsInjectable = getInjectable({
  id: "port-forwards-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(portForwardsRouteInjectable);
    const navigateToPortForwards = di.inject(navigateToPortForwardsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "port-forwards",
        parentId: networkSidebarItemId,

        title: "Port Forwarding",
        onClick: navigateToPortForwards,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 50,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default portForwardsSidebarItemsInjectable;

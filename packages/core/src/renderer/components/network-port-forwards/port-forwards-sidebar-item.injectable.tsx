/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import portForwardsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/port-forwards/port-forwards-route.injectable";
import networkSidebarItemInjectable from "../network/network-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPortForwardsInjectable from "../../../common/front-end-routing/routes/cluster/network/port-forwards/navigate-to-port-forwards.injectable";

const portForwardsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-port-forwards",

  instantiate: (di) => {
    const route = di.inject(portForwardsRouteInjectable);

    return {
      parentId: networkSidebarItemInjectable.id,
      title: "Port Forwarding",
      onClick: di.inject(navigateToPortForwardsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 50,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default portForwardsSidebarItemInjectable;

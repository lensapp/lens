/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import networkPoliciesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/network-policies/network-policies-route.injectable";
import { networkSidebarItemId } from "../+network/network-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToNetworkPoliciesInjectable from "../../../common/front-end-routing/routes/cluster/network/network-policies/navigate-to-network-policies.injectable";

const networkPoliciesSidebarItemsInjectable = getInjectable({
  id: "network-policies-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(networkPoliciesRouteInjectable);
    const navigateToNetworkPolicies = di.inject(navigateToNetworkPoliciesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "network-policies",
        parentId: networkSidebarItemId,
        title: "Network Policies",
        onClick: navigateToNetworkPolicies,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 40,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default networkPoliciesSidebarItemsInjectable;

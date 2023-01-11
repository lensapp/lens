/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import endpointsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/endpoints/endpoints-route.injectable";
import { networkSidebarItemId } from "../+network/network-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToEndpointsInjectable from "../../../common/front-end-routing/routes/cluster/network/endpoints/navigate-to-endpoints.injectable";

const endpointsSidebarItemsInjectable = getInjectable({
  id: "endpoints-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(endpointsRouteInjectable);
    const navigateToEndpoints = di.inject(navigateToEndpointsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "endpoints",
        parentId: networkSidebarItemId,
        title: "Endpoints",
        onClick: navigateToEndpoints,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 20,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default endpointsSidebarItemsInjectable;

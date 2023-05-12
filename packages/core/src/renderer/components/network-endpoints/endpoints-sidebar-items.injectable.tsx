/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import endpointsRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/endpoints/endpoints-route.injectable";
import networkSidebarItemInjectable from "../network/network-sidebar-items.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToEndpointsInjectable from "../../../common/front-end-routing/routes/cluster/network/endpoints/navigate-to-endpoints.injectable";

const endpointsSidebarItemInjectable = getInjectable({
  id: "endpoints-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(endpointsRouteInjectable);

    return {
      id: "endpoints",
      parentId: di.inject(networkSidebarItemInjectable).id,
      title: "Endpoints",
      onClick: di.inject(navigateToEndpointsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 20,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default endpointsSidebarItemInjectable;

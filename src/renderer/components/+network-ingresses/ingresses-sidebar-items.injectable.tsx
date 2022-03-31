/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import ingressesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/ingresses/ingresses-route.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import { networkSidebarItemId } from "../+network/network-sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToIngressesInjectable from "../../../common/front-end-routing/routes/cluster/network/ingresses/navigate-to-ingresses.injectable";

const ingressesSidebarItemsInjectable = getInjectable({
  id: "ingresses-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(ingressesRouteInjectable);
    const navigateToIngresses = di.inject(navigateToIngressesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "ingresses",
        parentId: networkSidebarItemId,
        title: "Ingresses",
        onClick: navigateToIngresses,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 30,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default ingressesSidebarItemsInjectable;

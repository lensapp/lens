/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import servicesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/services/services-route.injectable";
import { networkSidebarItemId } from "../+network/network-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToServicesInjectable from "../../../common/front-end-routing/routes/cluster/network/services/navigate-to-services.injectable";

const servicesSidebarItemsInjectable = getInjectable({
  id: "services-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(servicesRouteInjectable);
    const navigateToServices = di.inject(navigateToServicesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "services",
        parentId: networkSidebarItemId,
        title: "Services",
        onClick: navigateToServices,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 10,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default servicesSidebarItemsInjectable;

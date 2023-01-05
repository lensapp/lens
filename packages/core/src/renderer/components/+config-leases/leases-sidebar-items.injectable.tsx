/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import leasesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/leases/leases-route.injectable";
import { configSidebarItemId } from "../+config/config-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToLeasesInjectable from "../../../common/front-end-routing/routes/cluster/config/leases/navigate-to-leases.injectable";

const leasesSidebarItemsInjectable = getInjectable({
  id: "leases-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(leasesRouteInjectable);
    const navigateToLeases = di.inject(navigateToLeasesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "leases",
        parentId: configSidebarItemId,
        title: "Leases",
        onClick: navigateToLeases,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 80,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default leasesSidebarItemsInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import leasesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/leases/leases-route.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToLeasesInjectable from "../../../common/front-end-routing/routes/cluster/config/leases/navigate-to-leases.injectable";

const leasesSidebarItemInjectable = getInjectable({
  id: "sidebar-item-leases",

  instantiate: (di) => {
    const route = di.inject(leasesRouteInjectable);

    return {
      parentId: configSidebarItemInjectable.id,
      title: "Leases",
      onClick: di.inject(navigateToLeasesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 80,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default leasesSidebarItemInjectable;

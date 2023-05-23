/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import servicesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/services/services-route.injectable";
import networkSidebarItemInjectable from "../network/network-sidebar-items.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToServicesInjectable from "../../../common/front-end-routing/routes/cluster/network/services/navigate-to-services.injectable";

const servicesSidebarItemInjectable = getInjectable({
  id: "services-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(servicesRouteInjectable);

    return {
      id: "services",
      parentId: di.inject(networkSidebarItemInjectable).id,
      title: "Services",
      onClick: di.inject(navigateToServicesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 10,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default servicesSidebarItemInjectable;

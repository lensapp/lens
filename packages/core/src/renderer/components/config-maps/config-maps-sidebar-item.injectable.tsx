/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import configMapsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/config-maps/config-maps-route.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToConfigMapsInjectable from "../../../common/front-end-routing/routes/cluster/config/config-maps/navigate-to-config-maps.injectable";

const configMapsSidebarItemInjectable = getInjectable({
  id: "config-maps-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(configMapsRouteInjectable);

    return {
      id: "config-maps",
      parentId: di.inject(configSidebarItemInjectable).id,
      title: "ConfigMaps",
      onClick: di.inject(navigateToConfigMapsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 10,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default configMapsSidebarItemInjectable;

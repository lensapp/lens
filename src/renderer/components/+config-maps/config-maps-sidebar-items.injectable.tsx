/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import configMapsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/config-maps/config-maps-route.injectable";
import { configSidebarItemId } from "../+config/config-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToConfigMapsInjectable from "../../../common/front-end-routing/routes/cluster/config/config-maps/navigate-to-config-maps.injectable";

const configMapsSidebarItemsInjectable = getInjectable({
  id: "config-maps-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(configMapsRouteInjectable);
    const navigateToConfigMaps = di.inject(navigateToConfigMapsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "config-maps",
        parentId: configSidebarItemId,
        title: "ConfigMaps",
        onClick: navigateToConfigMaps,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 10,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default configMapsSidebarItemsInjectable;

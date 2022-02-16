/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import limitRangesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/limit-ranges/limit-ranges-route.injectable";
import { configSidebarItemId } from "../+config/config-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToLimitRangesInjectable from "../../../common/front-end-routing/routes/cluster/config/limit-ranges/navigate-to-limit-ranges.injectable";

const limitRangesSidebarItemsInjectable = getInjectable({
  id: "limit-ranges-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(limitRangesRouteInjectable);
    const navigateToLimitRanges = di.inject(navigateToLimitRangesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "limit-ranges",
        parentId: configSidebarItemId,
        title: "Limit Ranges",
        onClick: navigateToLimitRanges,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 40,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default limitRangesSidebarItemsInjectable;

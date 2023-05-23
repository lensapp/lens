/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import limitRangesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/limit-ranges/limit-ranges-route.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-items.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToLimitRangesInjectable from "../../../common/front-end-routing/routes/cluster/config/limit-ranges/navigate-to-limit-ranges.injectable";

const limitRangesSidebarItemInjectable = getInjectable({
  id: "limit-ranges-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(limitRangesRouteInjectable);

    return {
      id: "limit-ranges",
      parentId: di.inject(configSidebarItemInjectable).id,
      title: "Limit Ranges",
      onClick: di.inject(navigateToLimitRangesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 40,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default limitRangesSidebarItemInjectable;

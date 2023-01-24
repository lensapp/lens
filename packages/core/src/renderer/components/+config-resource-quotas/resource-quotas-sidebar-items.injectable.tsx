/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import resourceQuotasRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/resource-quotas/resource-quotas-route.injectable";
import { configSidebarItemId } from "../+config/config-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToResourceQuotasInjectable from "../../../common/front-end-routing/routes/cluster/config/resource-quotas/navigate-to-resource-quotas.injectable";

const resourceQuotasSidebarItemsInjectable = getInjectable({
  id: "resource-quotas-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(resourceQuotasRouteInjectable);
    const navigateToResourceQuotas = di.inject(navigateToResourceQuotasInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "resource-quotas",
        parentId: configSidebarItemId,
        title: "Resource Quotas",
        onClick: navigateToResourceQuotas,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 30,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default resourceQuotasSidebarItemsInjectable;

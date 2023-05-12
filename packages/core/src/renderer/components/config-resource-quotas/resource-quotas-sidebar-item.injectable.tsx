/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import resourceQuotasRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/resource-quotas/resource-quotas-route.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToResourceQuotasInjectable from "../../../common/front-end-routing/routes/cluster/config/resource-quotas/navigate-to-resource-quotas.injectable";

const resourceQuotasSidebarItemInjectable = getInjectable({
  id: "sidebar-item-resource-quotas",

  instantiate: (di) => {
    const route = di.inject(resourceQuotasRouteInjectable);

    return {
      parentId: configSidebarItemInjectable.id,
      title: "Resource Quotas",
      onClick: di.inject(navigateToResourceQuotasInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 30,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default resourceQuotasSidebarItemInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import serviceAccountsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/service-accounts/service-accounts-route.injectable";
import userManagementSidebarItemInjectable from "../user-management-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import navigateToServiceAccountsInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/service-accounts/navigate-to-service-accounts.injectable";

const serviceAccountsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-service-accounts",

  instantiate: (di) => {
    const route = di.inject(serviceAccountsRouteInjectable);

    return {
      parentId: userManagementSidebarItemInjectable.id,
      title: "Service Accounts",
      onClick: di.inject(navigateToServiceAccountsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 10,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default serviceAccountsSidebarItemInjectable;

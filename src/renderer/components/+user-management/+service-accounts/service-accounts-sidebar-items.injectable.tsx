/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import serviceAccountsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/service-accounts/service-accounts-route.injectable";
import { userManagementSidebarItemId } from "../user-management-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import navigateToServiceAccountsInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/service-accounts/navigate-to-service-accounts.injectable";

const serviceAccountsSidebarItemsInjectable = getInjectable({
  id: "service-accounts-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(serviceAccountsRouteInjectable);
    const navigateToServiceAccounts = di.inject(navigateToServiceAccountsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "service-accounts",
        parentId: userManagementSidebarItemId,
        title: "Service Accounts",
        onClick: navigateToServiceAccounts,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 10,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default serviceAccountsSidebarItemsInjectable;

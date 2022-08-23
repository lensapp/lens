/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import rolesRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/roles/roles-route.injectable";
import { userManagementSidebarItemId } from "../user-management-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import navigateToRolesInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/roles/navigate-to-roles.injectable";

const rolesSidebarItemsInjectable = getInjectable({
  id: "roles-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(rolesRouteInjectable);
    const navigateToRoles = di.inject(navigateToRolesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "roles",
        parentId: userManagementSidebarItemId,
        title: "Roles",
        onClick: navigateToRoles,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 30,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default rolesSidebarItemsInjectable;

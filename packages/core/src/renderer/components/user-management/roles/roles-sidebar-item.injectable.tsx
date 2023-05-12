/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import rolesRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/roles/roles-route.injectable";
import userManagementSidebarItemInjectable from "../user-management-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import navigateToRolesInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/roles/navigate-to-roles.injectable";

const rolesSidebarItemInjectable = getInjectable({
  id: "sidebar-item-roles",

  instantiate: (di) => {
    const route = di.inject(rolesRouteInjectable);

    return {
      parentId: userManagementSidebarItemInjectable.id,
      title: "Roles",
      onClick: di.inject(navigateToRolesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 30,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default rolesSidebarItemInjectable;

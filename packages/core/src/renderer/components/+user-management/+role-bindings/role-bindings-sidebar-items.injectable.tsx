/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import roleBindingsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/role-bindings/role-bindings-route.injectable";
import { userManagementSidebarItemId } from "../user-management-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import navigateToRoleBindingsInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/role-bindings/navigate-to-role-bindings.injectable";

const roleBindingsSidebarItemsInjectable = getInjectable({
  id: "role-bindings-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(roleBindingsRouteInjectable);
    const navigateToRoleBindings = di.inject(navigateToRoleBindingsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "role-bindings",
        parentId: userManagementSidebarItemId,
        title: "Role Bindings",
        onClick: navigateToRoleBindings,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 50,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default roleBindingsSidebarItemsInjectable;

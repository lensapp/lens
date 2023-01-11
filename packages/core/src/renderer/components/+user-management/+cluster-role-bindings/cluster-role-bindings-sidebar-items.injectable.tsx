/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import clusterRoleBindingsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/cluster-role-bindings/cluster-role-bindings-route.injectable";
import { userManagementSidebarItemId } from "../user-management-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import navigateToClusterRoleBindingsInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/cluster-role-bindings/navigate-to-cluster-role-bindings.injectable";

const clusterRoleBindingsSidebarItemsInjectable = getInjectable({
  id: "cluster-role-bindings-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(clusterRoleBindingsRouteInjectable);
    const navigateToClusterRoleBindings = di.inject(navigateToClusterRoleBindingsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "cluster-role-bindings",
        parentId: userManagementSidebarItemId,
        title: "Cluster Role Bindings",
        onClick: navigateToClusterRoleBindings,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 40,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default clusterRoleBindingsSidebarItemsInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import {
  SidebarItemRegistration,
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { Icon } from "../icon";
import React from "react";
import namespacesRouteInjectable from "../../../common/front-end-routing/routes/cluster/namespaces/namespaces-route.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToNamespacesInjectable from "../../../common/front-end-routing/routes/cluster/namespaces/navigate-to-namespaces.injectable";

const namespacesSidebarItemsInjectable = getInjectable({
  id: "namespaces",

  instantiate: (di) => {
    const route = di.inject(namespacesRouteInjectable);
    const navigateToNamespaces = di.inject(navigateToNamespacesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed((): SidebarItemRegistration[] => [
      {
        id: "namespaces",
        parentId: null,
        getIcon: () => <Icon material="layers" />,
        title: "Namespaces",
        onClick: navigateToNamespaces,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 70,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default namespacesSidebarItemsInjectable;

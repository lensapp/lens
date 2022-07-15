/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import priorityClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/priority-classes/priority-classes-route.injectable";
import { configSidebarItemId } from "../+config/config-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPriorityClassesInjectable from "../../../common/front-end-routing/routes/cluster/config/priority-classes/navigate-to-priority-classes.injectable";

const priorityClassesSidebarItemsInjectable = getInjectable({
  id: "priority-classes-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(priorityClassesRouteInjectable);
    const navigateToPriorityClasses = di.inject(navigateToPriorityClassesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "priority-classes",
        parentId: configSidebarItemId,
        title: "Priority Classes",
        onClick: navigateToPriorityClasses,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 60,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default priorityClassesSidebarItemsInjectable;

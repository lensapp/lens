/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import priorityClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/priority-classes/priority-classes-route.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-items.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPriorityClassesInjectable from "../../../common/front-end-routing/routes/cluster/config/priority-classes/navigate-to-priority-classes.injectable";

const priorityClassesSidebarItemInjectable = getInjectable({
  id: "priority-classes-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(priorityClassesRouteInjectable);

    return {
      id: "priority-classes",
      parentId: di.inject(configSidebarItemInjectable).id,
      title: "Priority Classes",
      onClick: di.inject(navigateToPriorityClassesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 70,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default priorityClassesSidebarItemInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import runtimeClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/runtime-classes/runtime-classes-route.injectable";
import { configSidebarItemId } from "../+config/config-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToRuntimeClassesInjectable from "../../../common/front-end-routing/routes/cluster/config/runtime-classes/navigate-to-runtime-classes.injectable";

const runtimeClassesSidebarItemsInjectable = getInjectable({
  id: "runtime-classes-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(runtimeClassesRouteInjectable);
    const navigateToRuntimeClasses = di.inject(navigateToRuntimeClassesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "runtime-classes",
        parentId: configSidebarItemId,
        title: "Runtime Classes",
        onClick: navigateToRuntimeClasses,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 70,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default runtimeClassesSidebarItemsInjectable;

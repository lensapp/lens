/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import runtimeClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/runtime-classes/runtime-classes-route.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToRuntimeClassesInjectable from "../../../common/front-end-routing/routes/cluster/config/runtime-classes/navigate-to-runtime-classes.injectable";

const runtimeClassesSidebarItemInjectable = getInjectable({
  id: "sidebar-item-runtime-classes",

  instantiate: (di) => {
    const route = di.inject(runtimeClassesRouteInjectable);

    return {
      parentId: configSidebarItemInjectable.id,
      title: "Runtime Classes",
      onClick: di.inject(navigateToRuntimeClassesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 70,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default runtimeClassesSidebarItemInjectable;

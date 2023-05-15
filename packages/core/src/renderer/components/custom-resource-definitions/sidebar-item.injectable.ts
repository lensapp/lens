/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { getInjectable } from "@ogre-tools/injectable";
import customResourceDefinitionsRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resource-definitions.injectable";
import navigateToCustomResourceDefinitionsInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/navigate-to-custom-resource-definitions.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import customResourcesSidebarItemInjectable from "../custom-resources/sidebar-item.injectable";

const customResourceDefinitionsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-custom-resource-definitions",
  instantiate: (di) => {
    const customResourceDefinitionsRoute = di.inject(customResourceDefinitionsRouteInjectable);

    return {
      parentId: customResourcesSidebarItemInjectable.id,
      title: "Definitions",
      onClick: di.inject(navigateToCustomResourceDefinitionsInjectable),
      isActive: di.inject(routeIsActiveInjectable, customResourceDefinitionsRoute),
      isVisible: customResourceDefinitionsRoute.isEnabled,
      orderNumber: 0,
    };
  },
  injectionToken: sidebarItemInjectionToken,
});

export default customResourceDefinitionsSidebarItemInjectable;

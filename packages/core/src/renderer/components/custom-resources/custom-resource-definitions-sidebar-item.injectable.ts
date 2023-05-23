/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { getInjectable } from "@ogre-tools/injectable";
import customResourceDefinitionsRouteInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/custom-resource-definitions.injectable";
import navigateToCustomResourcesInjectable from "../../../common/front-end-routing/routes/cluster/custom-resources/navigate-to-custom-resources.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import customResourcesSidebarItemInjectable from "./custom-resources-sidebar-item.injectable";

const customResourceDefinitionsSidebarItemInjectable = getInjectable({
  id: "custom-resource-definitions-sidebar-item",
  instantiate: (di) => {
    const customResourceDefinitionsRoute = di.inject(customResourceDefinitionsRouteInjectable);

    return {
      id: "custom-resource-definitions",
      parentId: di.inject(customResourcesSidebarItemInjectable).id,
      title: "Definitions",
      onClick: di.inject(navigateToCustomResourcesInjectable),
      isActive: di.inject(routeIsActiveInjectable, customResourceDefinitionsRoute),
      isVisible: customResourceDefinitionsRoute.isEnabled,
      orderNumber: 10,
    };
  },
  injectionToken: sidebarItemInjectionToken,
});

export default customResourceDefinitionsSidebarItemInjectable;

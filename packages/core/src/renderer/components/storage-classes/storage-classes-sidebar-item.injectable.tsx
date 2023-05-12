/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import storageClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/storage/storage-classes/storage-classes-route.injectable";
import storageSidebarItemInjectable from "../storage/storage-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToStorageClassesInjectable from "../../../common/front-end-routing/routes/cluster/storage/storage-classes/navigate-to-storage-classes.injectable";

const storageClassesSidebarItemInjectable = getInjectable({
  id: "sidebar-item-storage-classes",

  instantiate: (di) => {
    const route = di.inject(storageClassesRouteInjectable);

    return {
      parentId: storageSidebarItemInjectable.id,
      title: "Storage Classes",
      onClick: di.inject(navigateToStorageClassesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 30,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default storageClassesSidebarItemInjectable;

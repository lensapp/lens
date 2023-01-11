/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import storageClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/storage/storage-classes/storage-classes-route.injectable";
import { storageSidebarItemId } from "../+storage/storage-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToStorageClassesInjectable from "../../../common/front-end-routing/routes/cluster/storage/storage-classes/navigate-to-storage-classes.injectable";

const storageClassesSidebarItemsInjectable = getInjectable({
  id: "storage-classes-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(storageClassesRouteInjectable);
    const navigateToStorageClasses = di.inject(navigateToStorageClassesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "storage-classes",
        parentId: storageSidebarItemId,
        title: "Storage Classes",
        onClick: navigateToStorageClasses,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 30,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default storageClassesSidebarItemsInjectable;

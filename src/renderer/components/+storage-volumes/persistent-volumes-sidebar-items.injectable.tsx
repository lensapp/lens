/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import persistentVolumesRouteInjectable from "../../../common/front-end-routing/routes/cluster/storage/persistent-volumes/persistent-volumes-route.injectable";
import { storageSidebarItemId } from "../+storage/storage-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPersistentVolumesInjectable from "../../../common/front-end-routing/routes/cluster/storage/persistent-volumes/navigate-to-persistent-volumes.injectable";

const persistentVolumesSidebarItemsInjectable = getInjectable({
  id: "persistent-volumes-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(persistentVolumesRouteInjectable);
    const navigateToPersistentVolumes = di.inject(navigateToPersistentVolumesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "persistent-volumes",
        parentId: storageSidebarItemId,
        title: "Persistent Volumes",
        onClick: navigateToPersistentVolumes,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 20,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default persistentVolumesSidebarItemsInjectable;

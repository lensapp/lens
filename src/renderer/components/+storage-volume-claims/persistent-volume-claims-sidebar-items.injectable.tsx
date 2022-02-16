/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import persistentVolumeClaimsRouteInjectable from "../../../common/front-end-routing/routes/cluster/storage/persistent-volume-claims/persistent-volume-claims-route.injectable";
import { storageSidebarItemId } from "../+storage/storage-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPersistentVolumeClaimsInjectable from "../../../common/front-end-routing/routes/cluster/storage/persistent-volume-claims/navigate-to-persistent-volume-claims.injectable";

const persistentVolumeClaimsSidebarItemsInjectable = getInjectable({
  id: "persistent-volume-claims-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(persistentVolumeClaimsRouteInjectable);
    const navigateToPersistentVolumeClaims = di.inject(navigateToPersistentVolumeClaimsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "persistent-volume-claims",
        parentId: storageSidebarItemId,
        title: "Persistent Volume Claims",
        onClick: navigateToPersistentVolumeClaims,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 10,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default persistentVolumeClaimsSidebarItemsInjectable;

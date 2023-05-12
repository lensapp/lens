/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import persistentVolumeClaimsRouteInjectable from "../../../common/front-end-routing/routes/cluster/storage/persistent-volume-claims/persistent-volume-claims-route.injectable";
import storageSidebarItemInjectable from "../storage/storage-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToPersistentVolumeClaimsInjectable from "../../../common/front-end-routing/routes/cluster/storage/persistent-volume-claims/navigate-to-persistent-volume-claims.injectable";

const persistentVolumeClaimsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-persistent-volume-claims",

  instantiate: (di) => {
    const route = di.inject(persistentVolumeClaimsRouteInjectable);

    return {
      parentId: storageSidebarItemInjectable.id,
      title: "Persistent Volume Claims",
      onClick: di.inject(navigateToPersistentVolumeClaimsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 10,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default persistentVolumeClaimsSidebarItemInjectable;

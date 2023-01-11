/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import helmReleasesRouteInjectable from "../../../common/front-end-routing/routes/cluster/helm/releases/helm-releases-route.injectable";
import { helmSidebarItemId } from "../+helm/helm-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToHelmReleasesInjectable from "../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";

const helmReleasesSidebarItemsInjectable = getInjectable({
  id: "helm-releases-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(helmReleasesRouteInjectable);
    const navigateToHelmReleases = di.inject(navigateToHelmReleasesInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "releases",
        parentId: helmSidebarItemId,
        title: "Releases",
        onClick: navigateToHelmReleases,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 20,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default helmReleasesSidebarItemsInjectable;

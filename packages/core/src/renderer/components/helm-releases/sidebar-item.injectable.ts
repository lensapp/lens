/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import helmReleasesRouteInjectable from "../../../common/front-end-routing/routes/cluster/helm/releases/helm-releases-route.injectable";
import helmSidebarItemInjectable from "../helm/sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToHelmReleasesInjectable from "../../../common/front-end-routing/routes/cluster/helm/releases/navigate-to-helm-releases.injectable";

const helmReleasesSidebarItemInjectable = getInjectable({
  id: "sidebar-item-helm-releases",

  instantiate: (di) => {
    const route = di.inject(helmReleasesRouteInjectable);

    return {
      parentId: helmSidebarItemInjectable.id,
      title: "Releases",
      onClick: di.inject(navigateToHelmReleasesInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 20,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default helmReleasesSidebarItemInjectable;

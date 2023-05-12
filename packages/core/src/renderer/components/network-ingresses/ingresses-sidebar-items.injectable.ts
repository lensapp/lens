/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { getInjectable } from "@ogre-tools/injectable";
import navigateToIngressesInjectable from "../../../common/front-end-routing/routes/cluster/network/ingress-class/navigate-to-ingress-classes.injectable";
import ingressesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/ingresses/ingresses-route.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import networkSidebarItemInjectable from "../network/network-sidebar-item.injectable";

const ingressesSidebarItemInjectable = getInjectable({
  id: "sidebar-item-ingresses",
  instantiate: (di) => {
    const ingressRoute = di.inject(ingressesRouteInjectable);

    return {
      parentId: networkSidebarItemInjectable.id,
      title: "Ingresses",
      onClick: di.inject(navigateToIngressesInjectable),
      isActive: di.inject(routeIsActiveInjectable, ingressRoute),
      isVisible: ingressRoute.isEnabled,
      orderNumber: 30,
    };
  },
  injectionToken: sidebarItemInjectionToken,
});

export default ingressesSidebarItemInjectable;

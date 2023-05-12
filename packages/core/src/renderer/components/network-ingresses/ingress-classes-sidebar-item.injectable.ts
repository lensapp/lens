/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import { getInjectable } from "@ogre-tools/injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import networkSidebarItemInjectable from "../network/network-sidebar-item.injectable";
import navigateToIngressClassesInjectable from "../../../common/front-end-routing/routes/cluster/network/ingress-class/navigate-to-ingress-classes.injectable";
import ingressClassesRouteInjectable from "../../../common/front-end-routing/routes/cluster/network/ingress-class/ingress-classes-route.injectable";

const ingressClassesSidebarItemInjectable = getInjectable({
  id: "ingress-classes-sidebar-item",
  instantiate: (di) => {
    const ingressClassRoute = di.inject(ingressClassesRouteInjectable);

    return {
      id: "ingressclasses",
      parentId: di.inject(networkSidebarItemInjectable).id,
      title: "Ingress Classes",
      onClick: di.inject(navigateToIngressClassesInjectable),
      isActive: di.inject(routeIsActiveInjectable, ingressClassRoute),
      isVisible: ingressClassRoute.isEnabled,
      orderNumber: 31,
    };
  },
  injectionToken: sidebarItemInjectionToken,
});

export default ingressClassesSidebarItemInjectable;

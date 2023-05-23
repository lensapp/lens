/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import ingressesRouteInjectable
  from "../../../common/front-end-routing/routes/cluster/network/ingresses/ingresses-route.injectable";
import type {
  SidebarItemRegistration } from "../layout/sidebar-items.injectable";
import {
  sidebarItemsInjectionToken,
} from "../layout/sidebar-items.injectable";
import { networkSidebarItemId } from "../network/network-sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToIngressesInjectable
  from "../../../common/front-end-routing/routes/cluster/network/ingresses/navigate-to-ingresses.injectable";
import ingressClassesesRouteInjectable
  from "../../../common/front-end-routing/routes/cluster/network/ingress-class/ingress-classeses-route.injectable";
import navigateToIngressClassesInjectable
  from "../../../common/front-end-routing/routes/cluster/network/ingress-class/navigate-to-ingress-classes.injectable";

const ingressesSidebarItemsInjectable = getInjectable({
  id: "ingresses-sidebar-items",

  instantiate: (di): IComputedValue<SidebarItemRegistration[]> => {
    const ingressRoute = di.inject(ingressesRouteInjectable);
    const ingressClassRoute = di.inject(ingressClassesesRouteInjectable);

    return computed(() => [
      {
        id: "ingresses",
        parentId: networkSidebarItemId,
        title: "Ingresses",
        onClick: di.inject(navigateToIngressesInjectable),
        isActive: di.inject(routeIsActiveInjectable, ingressRoute),
        isVisible: ingressRoute.isEnabled,
        orderNumber: 30,
      },
      {
        id: "ingressclasses",
        parentId: networkSidebarItemId,
        title: "Ingress Classes",
        onClick: di.inject(navigateToIngressClassesInjectable),
        isActive: di.inject(routeIsActiveInjectable, ingressClassRoute),
        isVisible: ingressClassRoute.isEnabled,
        orderNumber: 31,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default ingressesSidebarItemsInjectable;

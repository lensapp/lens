/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { Services } from "../+network-services";
import { Endpoints } from "../+network-endpoints";
import { Ingresses } from "../+network-ingresses";
import { NetworkPolicies } from "../+network-policies";
import { PortForwards } from "../+network-port-forwards";
import * as routes from "../../../common/routes";
import type { IsAllowedResource } from "../../../common/utils/is-allowed-resource.injectable";
import isAllowedResourceInjectable from "../../../common/utils/is-allowed-resource.injectable";

interface Dependencies {
  isAllowedResource: IsAllowedResource;
}

function getRouteTabs({ isAllowedResource }: Dependencies) {
  return computed(() => {
    const tabs: TabLayoutRoute[] = [];

    if (isAllowedResource("services")) {
      tabs.push({
        title: "Services",
        component: Services,
        url: routes.servicesURL(),
        routePath: routes.servicesRoute.path.toString(),
      });
    }

    if (isAllowedResource("endpoints")) {
      tabs.push({
        title: "Endpoints",
        component: Endpoints,
        url: routes.endpointURL(),
        routePath: routes.endpointRoute.path.toString(),
      });
    }

    if (isAllowedResource("ingresses")) {
      tabs.push({
        title: "Ingresses",
        component: Ingresses,
        url: routes.ingressURL(),
        routePath: routes.ingressRoute.path.toString(),
      });
    }

    if (isAllowedResource("networkpolicies")) {
      tabs.push({
        title: "Network Policies",
        component: NetworkPolicies,
        url: routes.networkPoliciesURL(),
        routePath: routes.networkPoliciesRoute.path.toString(),
      });
    }

    tabs.push({
      title: "Port Forwarding",
      component: PortForwards,
      url: routes.portForwardsURL(),
      routePath: routes.portForwardsRoute.path.toString(),
    });

    return tabs;
  });
}

const networkRouteTabsInjectable = getInjectable({
  instantiate: (di) => getRouteTabs({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default networkRouteTabsInjectable;

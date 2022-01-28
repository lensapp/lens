/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import * as routes from "../../../common/routes";
import type { KubeResource } from "../../../common/rbac";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { computed, IComputedValue } from "mobx";
import { Services } from "../+services";
import { Endpoints } from "../+endpoints";
import { Ingresses } from "../+ingresses";
import { NetworkPolicies } from "../+network-policies";
import { PortForwards } from "../+port-forwards";
import isAllowedResourceInjectable from "../../utils/allowed-resource.injectable";

interface Dependencies {
  isAllowedResource: (resource: KubeResource) => boolean;
}

function getConfigRoutes({ isAllowedResource }: Dependencies): IComputedValue<TabLayoutRoute[]> {
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

const networkRoutesInjectable = getInjectable({
  instantiate: (di) => getConfigRoutes({
    isAllowedResource: di.inject(isAllowedResourceInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default networkRoutesInjectable;

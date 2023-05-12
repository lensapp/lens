/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import mutatingWebhookConfigurationsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/mutating-webhook-configurations/mutating-webhook-configurations-route.injectable";
import navigateToMutatingWebhookConfigurationsInjectable from "../../../common/front-end-routing/routes/cluster/config/mutating-webhook-configurations/navigate-to-mutating-webhook-configurations.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-items.injectable";

const mutatingWebhookConfigurationsSidebarItemInjectable = getInjectable({
  id: "mutating-webhook-configurations-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(mutatingWebhookConfigurationsRouteInjectable);

    return {
      id: "mutating-webhook-configurations",
      parentId: di.inject(configSidebarItemInjectable).id,
      title: "Mutating Webhook Configs",
      onClick: di.inject(navigateToMutatingWebhookConfigurationsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 100,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default mutatingWebhookConfigurationsSidebarItemInjectable;

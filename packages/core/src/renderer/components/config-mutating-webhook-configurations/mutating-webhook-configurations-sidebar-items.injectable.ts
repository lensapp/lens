/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import mutatingWebhookConfigurationsRouteInjectable
  from "../../../common/front-end-routing/routes/cluster/config/mutating-webhook-configurations/mutating-webhook-configurations-route.injectable";
import navigateToMutatingWebhookConfigurationsInjectable
  from "../../../common/front-end-routing/routes/cluster/config/mutating-webhook-configurations/navigate-to-mutating-webhook-configurations.injectable";
import { configSidebarItemId } from "../config/config-sidebar-items.injectable";

const mutatingWebhookConfigurationsSidebarItemsInjectable = getInjectable({
  id: "mutating-webhook-configurations-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(mutatingWebhookConfigurationsRouteInjectable);
    const navigateToPage = di.inject(navigateToMutatingWebhookConfigurationsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "mutating-webhook-configurations",
        parentId: configSidebarItemId,
        title: "Mutating Webhook Configs",
        onClick: navigateToPage,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 100,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default mutatingWebhookConfigurationsSidebarItemsInjectable;

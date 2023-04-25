/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import validatingWebhookConfigurationsRouteInjectable
  from "../../../common/front-end-routing/routes/cluster/config/validating-webhook-configurations/validating-webhook-configurations-route.injectable";
import navigateToValidatingWebhookConfigurationsInjectable
  from "../../../common/front-end-routing/routes/cluster/config/validating-webhook-configurations/navigate-to-validating-webhook-configurations.injectable";
import { configSidebarItemId } from "../config/config-sidebar-items.injectable";

const validatingWebhookConfigurationsSidebarItemsInjectable = getInjectable({
  id: "validating-webhook-configurations-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(validatingWebhookConfigurationsRouteInjectable);
    const navigateToPage = di.inject(navigateToValidatingWebhookConfigurationsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "validating-webhook-configurations",
        parentId: configSidebarItemId,
        title: "Validating Webhook Configs",
        onClick: navigateToPage,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 100,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default validatingWebhookConfigurationsSidebarItemsInjectable;

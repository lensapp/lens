/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import validatingWebhookConfigurationsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/validating-webhook-configurations/validating-webhook-configurations-route.injectable";
import navigateToValidatingWebhookConfigurationsInjectable from "../../../common/front-end-routing/routes/cluster/config/validating-webhook-configurations/navigate-to-validating-webhook-configurations.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-item.injectable";

const validatingWebhookConfigurationsSidebarItemInjectable = getInjectable({
  id: "sidebar-item-validating-webhook-configurations",

  instantiate: (di) => {
    const route = di.inject(validatingWebhookConfigurationsRouteInjectable);

    return {
      parentId: configSidebarItemInjectable.id,
      title: "Validating Webhook Configs",
      onClick: di.inject(navigateToValidatingWebhookConfigurationsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 100,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default validatingWebhookConfigurationsSidebarItemInjectable;

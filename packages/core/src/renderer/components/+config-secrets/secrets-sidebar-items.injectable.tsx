/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";

import secretsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/secrets/secrets-route.injectable";
import { configSidebarItemId } from "../+config/config-sidebar-items.injectable";
import { sidebarItemsInjectionToken } from "../layout/sidebar-items.injectable";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToSecretsInjectable from "../../../common/front-end-routing/routes/cluster/config/secrets/navigate-to-secrets.injectable";

const secretsSidebarItemsInjectable = getInjectable({
  id: "secrets-sidebar-items",

  instantiate: (di) => {
    const route = di.inject(secretsRouteInjectable);
    const navigateToSecrets = di.inject(navigateToSecretsInjectable);
    const routeIsActive = di.inject(routeIsActiveInjectable, route);

    return computed(() => [
      {
        id: "secrets",
        parentId: configSidebarItemId,
        title: "Secrets",
        onClick: navigateToSecrets,
        isActive: routeIsActive,
        isVisible: route.isEnabled,
        orderNumber: 20,
      },
    ]);
  },

  injectionToken: sidebarItemsInjectionToken,
});

export default secretsSidebarItemsInjectable;

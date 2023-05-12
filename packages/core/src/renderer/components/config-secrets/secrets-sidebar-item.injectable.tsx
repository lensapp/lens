/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import secretsRouteInjectable from "../../../common/front-end-routing/routes/cluster/config/secrets/secrets-route.injectable";
import configSidebarItemInjectable from "../config/config-sidebar-item.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../routes/route-is-active.injectable";
import navigateToSecretsInjectable from "../../../common/front-end-routing/routes/cluster/config/secrets/navigate-to-secrets.injectable";

const secretsSidebarItemInjectable = getInjectable({
  id: "secrets-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(secretsRouteInjectable);

    return {
      id: "secrets",
      parentId: di.inject(configSidebarItemInjectable).id,
      title: "Secrets",
      onClick: di.inject(navigateToSecretsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 20,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default secretsSidebarItemInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { map } from "lodash/fp";

import navigateToRouteInjectable from "../../../../main/navigate-to-route/navigate-to-route.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";

import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import { pipeline } from "@ogre-tools/fp";

const extensionSpecificTabNavigationItemRegistratorInjectable = getInjectable({
  id: "extension-specific-tab-preferences-navigation-items",

  instantiate: (di) => {
    return (extension: LensRendererExtension) => {
      const navigateToRoute = di.inject(navigateToRouteInjectable);

      const injectables = pipeline(
        extension.appPreferenceTabs,

        map((tab) => {
          const id = `extension-specific-tab-navigation-item-${tab.id}`;
          const route = {
            path: `/preferences/${tab.id}`,
            clusterFrame: false,
            isEnabled: computed(() => true),
          };
          const routeIsActive = di.inject(routeIsActiveInjectable, route);

          return getInjectable({
            id,
            injectionToken: preferenceNavigationItemInjectionToken,
            instantiate: () => ({
              id,
              label: tab.title,
              orderNumber: tab.orderNumber,
              navigate: () => navigateToRoute(route, {}),
              isVisible: computed(() => true),
              isActive: computed(() => routeIsActive.get()),
            }),
          });
        }),
      );

      injectables.forEach(di.register);

      return;
    };
  },
  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionSpecificTabNavigationItemRegistratorInjectable;

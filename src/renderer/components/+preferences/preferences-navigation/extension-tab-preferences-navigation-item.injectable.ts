/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { map } from "lodash/fp";

import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";

import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import { pipeline } from "@ogre-tools/fp";
import extensionPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/extension/extension-preferences-route.injectable";
import currentPathParametersInjectable from "../../../routes/current-path-parameters.injectable";
import navigateToExtensionPreferencesInjectable from "../../../../common/front-end-routing/routes/preferences/extension/navigate-to-extension-preferences.injectable";
import type { LensExtension } from "../../../../extensions/lens-extension";

const extensionSpecificTabNavigationItemRegistratorInjectable = getInjectable({
  id: "extension-specific-tab-preferences-navigation-items",

  instantiate: (di) => {
    return (ext: LensExtension, extensionInstallationCount) => {
      const extension = ext as LensRendererExtension;
      const navigateToExtensionPreferences = di.inject(
        navigateToExtensionPreferencesInjectable,
      );
      const route = di.inject(extensionPreferencesRouteInjectable);
      const routeIsActive = di.inject(routeIsActiveInjectable, route);
      const pathParameters = di.inject(currentPathParametersInjectable);

      const injectables = pipeline(
        extension.appPreferenceTabs,

        map((tab) => {
          const id = `extension-${extension.sanitizedExtensionId}-${extensionInstallationCount}-nav-item-${tab.id}`;
          const isActive = computed(() => routeIsActive.get() && pathParameters.get().tabId === tab.id);

          return getInjectable({
            id,
            injectionToken: preferenceNavigationItemInjectionToken,
            instantiate: () => ({
              id,
              label: tab.title,
              orderNumber: tab.orderNumber || 100,
              navigate: () => navigateToExtensionPreferences(extension.sanitizedExtensionId, tab.id),
              isVisible: computed(() => true),
              isActive,
            }),
          });
        }),
      );

      di.register(...injectables);

      return;
    };
  },
  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionSpecificTabNavigationItemRegistratorInjectable;

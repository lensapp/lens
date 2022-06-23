/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import extensionPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/extension/extension-preferences-route.injectable";
import navigateToExtensionPreferencesInjectable from "../../../../common/front-end-routing/routes/preferences/extension/navigate-to-extension-preferences.injectable";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import routePathParametersInjectable from "../../../routes/route-path-parameters.injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";

const extensionPreferencesNavigationItemRegistratorInjectable = getInjectable({
  id: "extension-preferences-navigation-item",

  instantiate: (di) => {
    return (ext) => {
      const extension = ext as LensRendererExtension;
      const navigateToExtensionPreferences = di.inject(
        navigateToExtensionPreferencesInjectable,
      );

      const extensionHasPreferences = extension.appPreferences.length > 0;
      const extensionHasGeneralPreferences = extension.appPreferences.some(preferences =>
        !preferences.showInPreferencesTab,
      );
      const isVisible = computed(() => extensionHasPreferences && extensionHasGeneralPreferences);
      const extensionRoute = di.inject(extensionPreferencesRouteInjectable);
      const pathParameters = di.inject(routePathParametersInjectable, extensionRoute);
      const routeIsActive = di.inject(routeIsActiveInjectable, extensionRoute);
      const isActive = computed(() => routeIsActive.get() && pathParameters.get().extensionId === extension.sanitizedExtensionId);
      const id = `extension-preferences-navigation-item-${extension.sanitizedExtensionId}`;

      const injectable = getInjectable({
        id,
        injectionToken: preferenceNavigationItemInjectionToken,
        instantiate: () => ({
          id: `extension-${extension.sanitizedExtensionId}`,
          label: `${extension.name}`,
          navigate: () => navigateToExtensionPreferences(extension.sanitizedExtensionId),
          isActive,
          isVisible,
          orderNumber: 20,
          parent: "extensions",
        }),
      });

      return [injectable];
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionPreferencesNavigationItemRegistratorInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import navigateToExtensionPreferencesInjectable from "../../../../common/front-end-routing/routes/preferences/extension/navigate-to-extension-preferences.injectable";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";

const extensionPreferencesNavigationItemRegistratorInjectable = getInjectable({
  id: "extension-preferences-navigation-item",

  instantiate: (di) => {
    return (extension: LensRendererExtension) => {
      const navigateToExtensionPreferences = di.inject(
        navigateToExtensionPreferencesInjectable,
      );

      const extensionInjectable = getInjectable({
        id: `extension-preferences-navigation-item-${extension.sanitizedExtensionId}`,
        instantiate: () => ({
          id: `extension-${extension.sanitizedExtensionId}`,
          label: `${extension.name}`,
          navigate: () => navigateToExtensionPreferences(extension.sanitizedExtensionId),
          isActive: computed(() => false),
          isVisible: computed(() => true),
          orderNumber: 20,
        }),
        injectionToken: preferenceNavigationItemInjectionToken,
      });

      di.register(extensionInjectable);
    };
  },

  injectionToken: extensionRegistratorInjectionToken,
});

export default extensionPreferencesNavigationItemRegistratorInjectable;

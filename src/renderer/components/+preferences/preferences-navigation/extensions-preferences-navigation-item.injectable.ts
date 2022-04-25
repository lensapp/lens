/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { matches } from "lodash/fp";
import { computed } from "mobx";
import extensionPreferencesRouteInjectable from "../../../../common/front-end-routing/routes/preferences/extension/extension-preferences-route.injectable";
import navigateToExtensionPreferencesInjectable from "../../../../common/front-end-routing/routes/preferences/extension/navigate-to-extension-preferences.injectable";
import { extensionRegistratorInjectionToken } from "../../../../extensions/extension-loader/extension-registrator-injection-token";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import currentPathParametersInjectable from "../../../routes/current-path-parameters.injectable";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";

const extensionPreferencesNavigationItemRegistratorInjectable = getInjectable({
  id: "extension-preferences-navigation-item",

  instantiate: (di) => {
    return (extension: LensRendererExtension) => {
      const navigateToExtensionPreferences = di.inject(
        navigateToExtensionPreferencesInjectable,
      );
      const isVisible = extension.appPreferences.length > 0;
      const extensionRoute = di.inject(extensionPreferencesRouteInjectable);
      const extensionPreferencesRouteIsActive = di.inject(routeIsActiveInjectable, extensionRoute);
      const pathParameters = di.inject(currentPathParametersInjectable);
      const extensionPreferencesPathParameters = { extensionId: extension.sanitizedExtensionId };
      const isActive = extensionPreferencesRouteIsActive.get() &&
        matches(extensionPreferencesPathParameters, pathParameters.get());

      const extensionInjectable = getInjectable({
        id: `extension-preferences-navigation-item-${extension.sanitizedExtensionId}`,
        instantiate: () => ({
          id: `extension-${extension.sanitizedExtensionId}`,
          label: `${extension.name}`,
          navigate: () => navigateToExtensionPreferences(extension.sanitizedExtensionId),
          isActive: computed(() => isActive),
          isVisible: computed(() => isVisible),
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

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import preferencesRouteInjectable from "../../common/preferences-route.injectable";
import routePathParametersInjectable from "../../../../renderer/routes/route-path-parameters.injectable";
import preferencesRouteForLegacyExtensionsInjectable from "../../common/preferences-route-for-legacy-extensions.injectable";

const currentPreferenceTabIdInjectable = getInjectable({
  id: "current-preference-tab-id",

  instantiate: (di) => {
    const preferencesRoute = di.inject(preferencesRouteInjectable);
    const preferencesRouteForLegacyExtensions = di.inject(preferencesRouteForLegacyExtensionsInjectable);
    const routePathParameters = di.inject(routePathParametersInjectable);

    const nonLegacyRoutePathParameters = routePathParameters(preferencesRoute);
    const legacyRoutePathParameters = routePathParameters(preferencesRouteForLegacyExtensions);

    return computed(() => {
      const nonLegacyPreferenceTabId = nonLegacyRoutePathParameters.get()?.preferenceTabId;

      if (nonLegacyPreferenceTabId) {
        return nonLegacyPreferenceTabId;
      }

      const legacyParameters = legacyRoutePathParameters.get();

      if (legacyParameters?.extensionId) {
        if (legacyParameters.preferenceTabId) {
          return `extension-${legacyParameters.extensionId}-${legacyParameters.preferenceTabId}`;
        }

        return legacyParameters.extensionId;
      }

      return "app";
    });
  },
});

export default currentPreferenceTabIdInjectable;

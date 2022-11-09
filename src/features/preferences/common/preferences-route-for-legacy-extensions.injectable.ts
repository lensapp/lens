/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { frontEndRouteInjectionToken } from "../../../common/front-end-routing/front-end-route-injection-token";

const preferencesRouteForLegacyExtensionsInjectable = getInjectable({
  id: "preferences-route-for-legacy-extensions",

  instantiate: () => ({
    path: "/preferences/extension/:extensionId/:preferenceTabId?",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default preferencesRouteForLegacyExtensionsInjectable;

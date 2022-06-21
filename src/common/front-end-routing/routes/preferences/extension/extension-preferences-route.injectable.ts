/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { frontEndRouteInjectionToken } from "../../../front-end-route-injection-token";
import type { Route } from "../../../front-end-route-injection-token";

interface ExtensionPreferenceRouteParams {
  extensionId: string;
  tabId?: string;
}

const extensionPreferencesRouteInjectable = getInjectable({
  id: "extension-preferences-route",

  instantiate: (): Route<ExtensionPreferenceRouteParams> => ({
    path: "/preferences/extension/:extensionId/:tabId?",
    clusterFrame: false,
    isEnabled: computed(() => true),
  }),

  injectionToken: frontEndRouteInjectionToken,
});

export default extensionPreferencesRouteInjectable;

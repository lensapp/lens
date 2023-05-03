/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getFrontEndRouteInjectable } from "../../../common/front-end-routing/front-end-route-injection-token";

const preferencesRouteForLegacyExtensionsInjectable = getFrontEndRouteInjectable({
  id: "preferences-route-for-legacy-extensions",
  path: "/preferences/extension/:extensionId/:preferenceTabId?",
  clusterFrame: false,
});

export default preferencesRouteForLegacyExtensionsInjectable;

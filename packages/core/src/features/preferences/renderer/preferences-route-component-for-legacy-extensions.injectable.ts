/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteSpecificComponentInjectable } from "../../../renderer/routes/route-specific-component-injection-token";
import preferencesRouteForLegacyExtensions from "../common/preferences-route-for-legacy-extensions.injectable";
import { Preferences } from "./preferences";

const preferencesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "preferences-route-component-for-legacy-extensions",
  routeInjectable: preferencesRouteForLegacyExtensions,
  Component: Preferences,
});

export default preferencesRouteComponentInjectable;

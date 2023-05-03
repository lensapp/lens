/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getRouteSpecificComponentInjectable } from "../../../renderer/routes/route-specific-component-injection-token";
import { Preferences } from "./preferences";
import preferencesRouteInjectable from "../common/preferences-route.injectable";

const preferencesRouteComponentInjectable = getRouteSpecificComponentInjectable({
  id: "preferences-route-component",
  Component: Preferences,
  routeInjectable: preferencesRouteInjectable,
});

export default preferencesRouteComponentInjectable;

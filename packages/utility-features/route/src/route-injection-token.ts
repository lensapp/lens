/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { Route } from "./route";

export const routeInjectionToken = getInjectionToken<Route<unknown, string>>({
  id: "route-injection-token",
});

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { Route } from "../../common/front-end-routing/front-end-route-injection-token";

export const routeSpecificComponentInjectionToken = getInjectionToken<{
  route: Route<unknown>;
  Component: React.ElementType<object>;
}>({
  id: "route-specific-component-injection-token",
});

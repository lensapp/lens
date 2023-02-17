/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { RouteHandler } from "../../../common/protocol-handler/registration";


export interface InternalRouteRegistration {
  path: string;
  handler: RouteHandler;
}

export const internalDeepLinkingRouteInjectionToken = getInjectionToken<InternalRouteRegistration>({
  id: "internal-protocol-route-token",
});

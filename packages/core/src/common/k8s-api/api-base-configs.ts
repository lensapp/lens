/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export const apiBaseServerAddressInjectionToken = getInjectionToken<string>({
  id: "api-base-config-server-address-token",
});

export const apiBaseHostHeaderInjectionToken = getInjectionToken<string>({
  id: "api-base-host-header-token",
});

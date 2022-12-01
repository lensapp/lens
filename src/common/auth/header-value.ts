/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export const lensAuthenticationHeaderValueInjectionToken = getInjectionToken<string>({
  id: "lens-authentication-header-value-token",
});

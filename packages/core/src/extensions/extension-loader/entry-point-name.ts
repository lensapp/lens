/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export const extensionEntryPointNameInjectionToken = getInjectionToken<"main" | "renderer">({
  id: "extension-entry-point-name-token",
});

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export const createStoresAndApisInjectionToken = getInjectionToken<boolean>({
  id: "create-stores-and-apis-token",
});

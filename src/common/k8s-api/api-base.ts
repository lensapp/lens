/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JsonApi } from "./json-api";
import { getInjectionToken } from "@ogre-tools/injectable";

export const apiBaseInjectionToken = getInjectionToken<JsonApi>({
  id: "api-base-token",
});

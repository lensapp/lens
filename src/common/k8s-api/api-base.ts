/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JsonApi } from "./json-api";
import { getInjectionToken } from "@ogre-tools/injectable";
import { asLegacyGlobalForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

export const apiBaseInjectionToken = getInjectionToken<JsonApi>({
  id: "api-base-token",
});

export const apiBase = asLegacyGlobalForExtensionApi(apiBaseInjectionToken);

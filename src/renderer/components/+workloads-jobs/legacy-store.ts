/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import jobStoreInjectable from "./store.injectable";

/**
 * @deprecated use `di.inject(jobStoreInjectable)` instead
 */
export const jobStore = asLegacyGlobalForExtensionApi(jobStoreInjectable);

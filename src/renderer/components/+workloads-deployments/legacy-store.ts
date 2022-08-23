/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import deploymentStoreInjectable from "./store.injectable";

/**
 * @deprecated use `di.inject(deploymentStoreInjectable)` instead
 */
export const deploymentStore = asLegacyGlobalForExtensionApi(deploymentStoreInjectable);

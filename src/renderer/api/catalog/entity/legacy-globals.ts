/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalFunctionForExtensionApi } from "../../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import getActiveClusterEntityInjectable from "./get-active-cluster-entity.injectable";

/**
 * @deprecated use `di.inject(getActiveClusterEntityInjectable)` instead
 */
export const getActiveClusterEntity = asLegacyGlobalFunctionForExtensionApi(getActiveClusterEntityInjectable);

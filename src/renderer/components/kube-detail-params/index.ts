/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalFunctionForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import showDetailsInjectable from "./show-details.injectable";

/**
 * @deprecated use `di.inject(showDetailsInjectable)` instead
 */
export const showDetails = asLegacyGlobalFunctionForExtensionApi(showDetailsInjectable);

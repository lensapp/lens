/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalFunctionForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import navigateInjectable from "./navigate.injectable";

export { searchParamsOptions } from "./search-params";

/**
 * @deprecated use `di.inject(navigateInjectable)` instead
 */
export const navigate = asLegacyGlobalFunctionForExtensionApi(navigateInjectable);

export * from "./page-param";

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalFunctionForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { asLegacyGlobalForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import matchRouteInjectable from "./match-route.injectable";
import navigateInjectable from "./navigate.injectable";
import observableHistoryInjectable from "./observable-history.injectable";

export { searchParamsOptions } from "./search-params";

/**
 * @deprecated use `di.inject(observableHistoryInjectable)` instead
 */
export const navigation = asLegacyGlobalForExtensionApi(observableHistoryInjectable);

/**
 * @deprecated use `di.inject(navigateInjectable)` instead
 */
export const navigate = asLegacyGlobalFunctionForExtensionApi(navigateInjectable);

/**
 * @deprecated use `di.inject(matchRouteInjectable)` instead
 */
export const matchRoute = asLegacyGlobalFunctionForExtensionApi(matchRouteInjectable);

export * from "./page-param";

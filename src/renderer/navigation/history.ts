/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import observableHistoryInjectable from "./history/observable.injectable";

export { searchParamsOptions } from "./history/search-params";

/**
 * @deprecated: Switch to using di.inject(observableHistoryInjectable)
 */
export const navigation = asLegacyGlobalForExtensionApi(observableHistoryInjectable);

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import openLinkInBrowserInjectable from "../../common/utils/open-link-in-browser.injectable";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";

export { Singleton, getAppVersion } from "../../common/utils";
export { prevDefault, stopPropagation } from "../../renderer/utils/prevDefault";
export { cssNames } from "../../renderer/utils/cssNames";

/**
 * @deprecated Use {@link openBrowser} instead
 */
export const openExternal = asLegacyGlobalFunctionForExtensionApi(openLinkInBrowserInjectable);
export const openBrowser = asLegacyGlobalFunctionForExtensionApi(openLinkInBrowserInjectable);

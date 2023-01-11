/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { resolveSystemProxyInjectionToken } from "../../common/utils/resolve-system-proxy/resolve-system-proxy-injection-token";

/**
 * Resolves URL-specific proxy information from system. See more here: https://www.electronjs.org/docs/latest/api/session#sesresolveproxyurl
 * @param url - The URL for proxy information
 * @returns Promise for proxy information as string
 */
export const resolveSystemProxy = asLegacyGlobalFunctionForExtensionApi(resolveSystemProxyInjectionToken);

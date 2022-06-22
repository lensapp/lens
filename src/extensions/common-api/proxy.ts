/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { resolveSystemProxyInjectionToken } from "../../common/utils/resolve-system-proxy/resolve-system-proxy-injection-token";

export const resolveSystemProxy = asLegacyGlobalFunctionForExtensionApi(resolveSystemProxyInjectionToken);

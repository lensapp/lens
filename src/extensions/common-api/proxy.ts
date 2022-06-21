/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { resolveProxyInjectionToken } from "../../behaviours/proxy/resolve-proxy/common/resolve-proxy-injection-token";

export const resolveProxy = asLegacyGlobalFunctionForExtensionApi(resolveProxyInjectionToken);

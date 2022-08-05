/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { apiBaseInjectionToken } from "../../common/k8s-api/api-base";
import { apiKubeInjectionToken } from "../../common/k8s-api/api-kube";
import { asLegacyGlobalForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

export const apiBase = asLegacyGlobalForExtensionApi(apiBaseInjectionToken);
export const apiKube = asLegacyGlobalForExtensionApi(apiKubeInjectionToken);

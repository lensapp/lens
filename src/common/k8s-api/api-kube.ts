/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import apiKubeInjectable from "./api-kube.injectable";

export const apiKube = asLegacyGlobalForExtensionApi(apiKubeInjectable);

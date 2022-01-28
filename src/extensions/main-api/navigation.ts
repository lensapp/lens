/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import windowManagerInjectable from "../../main/windows/manager.injectable";
import { asLegacyGlobalObjectForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

export function navigate(url: string) {
  asLegacyGlobalObjectForExtensionApi(windowManagerInjectable).navigate(url);
}

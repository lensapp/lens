/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import windowManagerInjectable from "../../main/window/manager.injectable";
import { getLegacyGlobalDiForExtensionApi } from "../as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";

export function navigate(url: string) {
  const di = getLegacyGlobalDiForExtensionApi();
  const windowManager = di.inject(windowManagerInjectable);

  return windowManager.navigate(url);
}

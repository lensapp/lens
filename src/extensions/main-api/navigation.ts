/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import {
  Environments,
  getEnvironmentSpecificLegacyGlobalDiForExtensionApi,
} from "../as-legacy-globals-for-extension-api/legacy-global-di-for-extension-api";

import windowManagerInjectable from "../../main/window-manager.injectable";

export function navigate(url: string) {
  const di = getEnvironmentSpecificLegacyGlobalDiForExtensionApi(Environments.main);

  const windowManager = di.inject(windowManagerInjectable);

  return windowManager.navigate(url);
}

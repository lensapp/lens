/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import themeStoreInjectable from "../../renderer/themes/store.injectable";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

const themeStore = asLegacyGlobalForExtensionApi(themeStoreInjectable);

export function getActiveTheme() {
  return themeStore.activeTheme;
}

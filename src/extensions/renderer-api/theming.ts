/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import activeThemeInjectable from "../../renderer/themes/active-theme.injectable";
import { asLegacyGlobalObjectForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

const activeTheme = asLegacyGlobalObjectForExtensionApi(activeThemeInjectable);

export function getActiveTheme() {
  return activeTheme.get();
}

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import activeThemeInjectable from "../../renderer/themes/active.injectable";
import type { LensTheme } from "../../renderer/themes/lens-theme";
import { asLegacyGlobalForExtensionApi } from "@k8slens/legacy-global-di";

export const activeTheme = asLegacyGlobalForExtensionApi(activeThemeInjectable);

/**
 * @deprecated This hides the reactivity of active theme, use {@link activeTheme} instead
 */
export function getActiveTheme() {
  return activeTheme.get();
}

export type { LensTheme };

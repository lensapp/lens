/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { StatusBarStatus } from "../../renderer/components/status-bar/current-status.injectable";
import type { SetStatusBarStatus } from "../../renderer/components/status-bar/set-status-bar-status.injectable";
import setStatusBarStatusInjectable from "../../renderer/components/status-bar/set-status-bar-status.injectable";
import activeThemeInjectable from "../../renderer/themes/active.injectable";
import type { LensTheme } from "../../renderer/themes/lens-theme";
import { asLegacyGlobalFunctionForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-function-for-extension-api";
import { asLegacyGlobalForExtensionApi } from "../as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";

export const activeTheme = asLegacyGlobalForExtensionApi(activeThemeInjectable);

/**
 * @deprecated This hides the reactivity of active theme, use {@link activeTheme} instead
 */
export function getActiveTheme() {
  return activeTheme.get();
}

export const setStatusBarStatus = asLegacyGlobalFunctionForExtensionApi(setStatusBarStatusInjectable);

export type {
  LensTheme,
  StatusBarStatus,
  SetStatusBarStatus,
};

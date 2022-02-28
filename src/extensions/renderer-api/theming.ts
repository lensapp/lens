/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ThemeStore } from "../../renderer/theme.store";

export type { Theme } from "../../renderer/theme.store";
export type { MonacoTheme, MonacoCustomTheme } from "../../renderer/components/monaco-editor";

export function getActiveTheme() {
  return ThemeStore.getInstance().activeTheme;
}

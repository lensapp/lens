/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { MonacoTheme } from "../components/monaco-editor";

export type ThemeId = string;
export type LensThemeType = "dark" | "light";
export interface LensTheme {
  name: string;
  type: LensThemeType;
  colors: Record<string, string>;
  description: string;
  author: string;
  monacoTheme: MonacoTheme;
  isDefault?: boolean;
}

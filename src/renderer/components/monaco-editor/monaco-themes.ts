/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Monaco editor themes customization
import { editor } from "monaco-editor";
import cloudsMidnight from "./monaco-themes/clouds-midnight.json";

export type MonacoTheme = "vs" | "vs-dark" | "hc-black" | MonacoCustomTheme;
export type MonacoCustomTheme = "clouds-midnight";

export interface MonacoThemeData extends editor.IStandaloneThemeData {
  name?: string;
}

// Registered names could be then used in "themes/*.json" in "{monacoTheme: [name]}"
export const customThemes: Partial<Record<MonacoCustomTheme, MonacoThemeData>> = {
  "clouds-midnight": cloudsMidnight as MonacoThemeData,
};

export function registerCustomThemes(): void {
  Object.entries(customThemes).forEach(([name, theme]) => {
    editor.defineTheme(name, theme);
  });
}

export async function loadCustomTheme(name: string): Promise<MonacoThemeData> {
  return import(`./monaco-themes/${name}.json`);
}

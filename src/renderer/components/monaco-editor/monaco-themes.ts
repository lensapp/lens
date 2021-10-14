/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Monaco editor themes customization
import { editor } from "monaco-editor";
import cloudsMidnight from "./monaco-theme.clouds-midnight.json";

export interface MonacoCustomTheme extends editor.IStandaloneThemeData {
  name?: string;
}

// Registered names could be then used in "themes/*.json" in "{monacoTheme: [name]}"
export const customThemes = {
  [cloudsMidnight.name]: cloudsMidnight as MonacoCustomTheme,
};

export function registerCustomThemes(): void {
  Object.entries(customThemes).forEach(([name, theme]) => {
    editor.defineTheme(name, theme);
  });
}

export async function loadCustomTheme(name: string): Promise<MonacoCustomTheme> {
  return import(`./monaco-theme.${name}.json`);
}

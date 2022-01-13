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

import { computed, makeObservable, observable, reaction } from "mobx";
import { autoBind, Singleton } from "./utils";
import { UserStore } from "../common/user-store";
import logger from "../main/logger";
import lensDarkThemeJson from "./themes/lens-dark.json";
import lensLightThemeJson from "./themes/lens-light.json";
import type { SelectOption } from "./components/select";
import type { MonacoEditorProps } from "./components/monaco-editor";
import { defaultTheme } from "../common/vars";

export type ThemeId = string;

export interface Theme {
  name: string;
  type: "dark" | "light";
  colors: Record<string, string>;
  description: string;
  author: string;
  monacoTheme: MonacoEditorProps["theme"];
}

export class ThemeStore extends Singleton {
  protected styles: HTMLStyleElement;

  // bundled themes from `themes/${themeId}.json`
  private themes = observable.map<ThemeId, Theme>({
    "lens-dark": lensDarkThemeJson as Theme,
    "lens-light": lensLightThemeJson as Theme,
  });

  @computed get activeThemeId(): string {
    return UserStore.getInstance().colorTheme;
  }

  @computed get activeTheme(): Theme {
    return this.themes.get(this.activeThemeId) ?? this.themes.get(defaultTheme);
  }

  @computed get themeOptions(): SelectOption<string>[] {
    return Array.from(this.themes).map(([themeId, theme]) => ({
      label: theme.name,
      value: themeId,
    }));
  }

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);

    // auto-apply active theme
    reaction(() => this.activeThemeId, themeId => {
      try {
        this.applyTheme(this.getThemeById(themeId));
      } catch (err) {
        logger.error(err);
        UserStore.getInstance().resetTheme();
      }
    }, {
      fireImmediately: true,
    });
  }

  getThemeById(themeId: ThemeId): Theme {
    return this.themes.get(themeId);
  }

  protected applyTheme(theme: Theme) {
    if (!this.styles) {
      this.styles = document.createElement("style");
      this.styles.id = "lens-theme";
      document.head.append(this.styles);
    }
    const cssVars = Object.entries(theme.colors).map(([cssName, color]) => {
      return `--${cssName}: ${color};`;
    });

    this.styles.textContent = `:root {\n${cssVars.join("\n")}}`;
    // Adding universal theme flag which can be used in component styles
    const body = document.querySelector("body");

    body.classList.toggle("theme-light", theme.type === "light");
  }
}

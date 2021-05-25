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

import { computed, observable, reaction, makeObservable } from "mobx";
import { autoBind, boundMethod, Singleton } from "./utils";
import { UserStore } from "../common/user-store";
import logger from "../main/logger";

export type ThemeId = string;

export enum ThemeType {
  DARK = "dark",
  LIGHT = "light",
}

export interface Theme {
  id: ThemeId; // filename without .json-extension
  type: ThemeType;
  name?: string;
  colors?: Record<string, string>;
  description?: string;
  author?: string;
}

export class ThemeStore extends Singleton {
  protected styles: HTMLStyleElement;

  // bundled themes from `themes/${themeId}.json`
  private allThemes = observable.map<string, Theme>([
    ["lens-dark", { id: "lens-dark", type: ThemeType.DARK }],
    ["lens-light", { id: "lens-light", type: ThemeType.LIGHT }],
  ]);

  @computed get themeIds(): string[] {
    return Array.from(this.allThemes.keys());
  }

  @computed get themes(): Theme[] {
    return Array.from(this.allThemes.values());
  }

  @computed get activeThemeId(): string {
    return UserStore.getInstance().colorTheme;
  }

  @computed get activeTheme(): Theme {
    const activeTheme = this.allThemes.get(this.activeThemeId) ?? this.allThemes.get("lens-dark");

    return {
      colors: {},
      ...activeTheme,
    };
  }

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);

    // auto-apply active theme
    reaction(() => this.activeThemeId, async themeId => {
      try {
        this.applyTheme(await this.loadTheme(themeId));
      } catch (err) {
        logger.error(err);
        UserStore.getInstance().resetTheme();
      }
    }, {
      fireImmediately: true,
    });
  }

  async init() {
    // preload all themes
    await Promise.all(this.themeIds.map(this.loadTheme));
  }

  getThemeById(themeId: ThemeId): Theme {
    return this.allThemes.get(themeId);
  }

  @boundMethod
  protected async loadTheme(themeId: ThemeId): Promise<Theme> {
    try {
      const existingTheme = this.getThemeById(themeId);

      if (existingTheme) {
        const theme = await import(
          /* webpackChunkName: "themes/[name]" */
          `./themes/${themeId}.json`
        );

        existingTheme.author = theme.author;
        existingTheme.colors = theme.colors;
        existingTheme.description = theme.description;
        existingTheme.name = theme.name;
      }

      return existingTheme;
    } catch (err) {
      throw new Error(`Can't load theme "${themeId}": ${err}`);
    }
  }

  protected applyTheme(theme: Theme) {
    if (!this.styles) {
      this.styles = document.createElement("style");
      this.styles.id = "lens-theme";
      document.head.prepend(this.styles);
    }
    const cssVars = Object.entries(theme.colors).map(([cssName, color]) => {
      return `--${cssName}: ${color};`;
    });

    this.styles.textContent = `:root {\n${cssVars.join("\n")}}`;
    // Adding universal theme flag which can be used in component styles
    const body = document.querySelector("body");

    body.classList.toggle("theme-light", theme.type === ThemeType.LIGHT);
  }
}

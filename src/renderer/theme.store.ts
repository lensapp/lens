/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
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

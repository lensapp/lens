/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { comparer, computed, makeObservable, observable, reaction } from "mobx";
import { autoBind, Singleton } from "./utils";
import { UserStore } from "../common/user-store";
import logger from "../main/logger";
import lensDarkThemeJson from "./themes/lens-dark.json";
import lensLightThemeJson from "./themes/lens-light.json";
import type { SelectOption } from "./components/select";
import type { MonacoEditorProps } from "./components/monaco-editor";
import { defaultTheme } from "../common/vars";
import { camelCase } from "lodash";

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
  private terminalColorPrefix = "terminal";

  // bundled themes from `themes/${themeId}.json`
  private themes = observable.map<ThemeId, Theme>({
    "lens-dark": lensDarkThemeJson as Theme,
    "lens-light": lensLightThemeJson as Theme,
  });

  @computed get activeThemeId(): ThemeId {
    return UserStore.getInstance().colorTheme;
  }

  @computed get terminalThemeId(): ThemeId {
    return UserStore.getInstance().terminalTheme;
  }

  @computed get activeTheme(): Theme {
    return this.themes.get(this.activeThemeId) ?? this.themes.get(defaultTheme);
  }

  @computed get terminalColors(): [string, string][] {
    const theme = this.themes.get(this.terminalThemeId) ?? this.activeTheme;

    return Object
      .entries(theme.colors)
      .filter(([name]) => name.startsWith(this.terminalColorPrefix));
  }

  // Replacing keys stored in styles to format accepted by terminal
  // E.g. terminalBrightBlack -> brightBlack
  @computed get xtermColors(): Record<string, string> {
    return Object.fromEntries(
      this.terminalColors.map(([name, color]) => [
        camelCase(name.replace(this.terminalColorPrefix, "")),
        color,
      ]),
    );
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
    reaction(() => ({
      themeId: this.activeThemeId,
      terminalThemeId: this.terminalThemeId,
    }), ({ themeId }) => {
      try {
        this.applyTheme(themeId);
      } catch (err) {
        logger.error(err);
        UserStore.getInstance().resetTheme();
      }
    }, {
      fireImmediately: true,
      equals: comparer.shallow,
    });
  }

  getThemeById(themeId: ThemeId): Theme {
    return this.themes.get(themeId);
  }

  protected applyTheme(themeId: ThemeId) {
    const theme = this.getThemeById(themeId);
    const colors = Object.entries({
      ...theme.colors,
      ...Object.fromEntries(this.terminalColors),
    });

    colors.forEach(([name, value]) => {
      document.documentElement.style.setProperty(`--${name}`, value);
    });

    // Adding universal theme flag which can be used in component styles
    document.body.classList.toggle("theme-light", theme.type === "light");
  }
}

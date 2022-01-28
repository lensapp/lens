/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { comparer, computed, IComputedValue, makeObservable, observable, reaction } from "mobx";
import { autoBind } from "../utils";
import logger from "../../main/logger";
import lensDarkThemeJson from "../internal-themes/lens-dark.json";
import lensLightThemeJson from "../internal-themes/lens-light.json";
import type { SelectOption } from "../components/select";
import type { MonacoEditorProps } from "../components/monaco-editor";
import { defaultTheme } from "../../common/vars";
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

export interface ThemeStoreDependencies {
  readonly colorThemeId: IComputedValue<string>;
  readonly terminalThemeId: IComputedValue<string>;
  resetThemeSelection: () => void;
}

export class ThemeStore {
  private terminalColorPrefix = "terminal";

  // bundled themes from `themes/${themeId}.json`
  private themes = observable.map<ThemeId, Theme>({
    "lens-dark": lensDarkThemeJson as Theme,
    "lens-light": lensLightThemeJson as Theme,
  });

  @computed get activeTheme(): Theme {
    return this.themes.get(this.dependencies.colorThemeId.get()) ?? this.themes.get(defaultTheme);
  }

  @computed get terminalColors(): [string, string][] {
    const theme = this.themes.get(this.dependencies.terminalThemeId.get()) ?? this.activeTheme;

    return Object
      .entries(theme.colors)
      .filter(([name]) => name.startsWith(this.terminalColorPrefix));
  }

  // Replacing keys stored in styles to format accepted by terminal
  // E.g. terminalBrightBlack -> brightBlack
  readonly xtermColors = computed(() => (
    Object.fromEntries(
      this.terminalColors.map(([name, color]) => [
        camelCase(name.replace(this.terminalColorPrefix, "")),
        color,
      ]),
    )
  ));

  @computed get themeOptions(): SelectOption<string>[] {
    return Array.from(this.themes).map(([themeId, theme]) => ({
      label: theme.name,
      value: themeId,
    }));
  }

  constructor(protected readonly dependencies: ThemeStoreDependencies) {
    makeObservable(this);
    autoBind(this);

    // auto-apply active theme
    reaction(() => ({
      themeId: this.dependencies.colorThemeId.get(),
      terminalThemeId: this.dependencies.terminalThemeId.get(),
    }), ({ themeId }) => {
      try {
        this.applyTheme(themeId);
      } catch (err) {
        logger.error(err);
        this.dependencies.resetThemeSelection();
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

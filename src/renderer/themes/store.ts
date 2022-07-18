/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { comparer, computed, makeObservable, observable, reaction } from "mobx";
import { autoBind } from "../utils";
import logger from "../../main/logger";
import lensDarkTheme from "./lens-dark";
import lensLightTheme from "./lens-light";
import type { MonacoTheme } from "../components/monaco-editor";
import { defaultThemeId } from "../../common/vars";
import { camelCase } from "lodash";
import type { IpcRenderer } from "electron";
import { getNativeThemeChannel, setNativeThemeChannel } from "../../common/ipc/native-theme";
import type { ReadonlyDeep } from "type-fest/source/readonly-deep";
import assert from "assert";

export type ThemeId = string;

export interface Theme {
  name: string;
  type: "dark" | "light";
  colors: Record<string, string>;
  description: string;
  author: string;
  monacoTheme: MonacoTheme;
}

interface Dependencies {
  readonly userStore: {
    colorTheme: string;
    terminalTheme: ThemeId;
    resetTheme(): void;
  };
  readonly ipcRenderer: IpcRenderer;
}

export class ThemeStore {
  private terminalColorPrefix = "terminal";

  #themes = observable.map<ThemeId, Theme>({
    "lens-dark": lensDarkTheme,
    "lens-light": lensLightTheme,
  });

  @observable private osNativeThemeType: "dark" | "light" | undefined;

  @computed private get colorThemePreference(): ThemeId | "system" {
    return this.dependencies.userStore.colorTheme;
  }

  @computed private get activeThemeId(): ThemeId {
    if (this.colorThemePreference === "system") {
      if (this.osNativeThemeType) {
        return `lens-${this.osNativeThemeType}`;
      } else {
        return defaultThemeId;
      }
    } else {
      return this.colorThemePreference;
    }
  }

  @computed private get terminalThemeId(): ThemeId {
    return this.dependencies.userStore.terminalTheme;
  }

  private readonly defaultTheme: Theme;

  @computed get activeTheme(): Theme {
    return this.themes.get(this.activeThemeId) ?? this.defaultTheme;
  }

  @computed private get terminalColors(): [string, string][] {
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

  get themes() {
    return this.#themes as ReadonlyDeep<Map<string, Theme>>;
  }

  constructor(protected readonly dependencies: Dependencies) {
    makeObservable(this);
    autoBind(this);
    this.init();

    const defaultTheme = this.#themes.get(defaultThemeId);

    assert(defaultTheme, `${defaultThemeId} is invalid as there is no corresponding theme`);

    this.defaultTheme = defaultTheme;
  }

  async init() {
    this.osNativeThemeType = await this.dependencies.ipcRenderer.invoke(getNativeThemeChannel);
    this.dependencies.ipcRenderer.on(setNativeThemeChannel, (event, theme: "dark" | "light") => {
      this.osNativeThemeType = theme;
    });

    // auto-apply active theme
    reaction(() => ({
      themeId: this.activeThemeId,
      terminalThemeId: this.terminalThemeId,
    }), () => {
      try {
        this.applyActiveTheme();
      } catch (err) {
        logger.error(`Failed to apply active theme: ${err}`);
        this.dependencies.userStore.resetTheme();
      }
    }, {
      fireImmediately: true,
      equals: comparer.shallow,
    });
  }

  getThemeById(themeId: ThemeId): Theme | undefined {
    return this.themes.get(themeId);
  }

  protected applyActiveTheme() {
    const colors = Object.entries({
      ...this.activeTheme.colors,
      ...Object.fromEntries(this.terminalColors),
    });

    colors.forEach(([name, value]) => {
      document.documentElement.style.setProperty(`--${name}`, value);
    });

    // Adding universal theme flag which can be used in component styles
    document.body.classList.toggle("theme-light", this.activeTheme.type === "light");
  }
}

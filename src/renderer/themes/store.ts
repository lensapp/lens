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

  @observable osNativeTheme: "dark" | "light" | undefined;

  @computed get activeThemeId(): ThemeId {
    return this.dependencies.userStore.colorTheme;
  }

  @computed get terminalThemeId(): ThemeId {
    return this.dependencies.userStore.terminalTheme;
  }

  private readonly defaultTheme: Theme;

  @computed get activeTheme(): Theme {
    return this.systemTheme
      ?? this.#themes.get(this.activeThemeId)
      ?? this.defaultTheme;
  }

  @computed get terminalColors(): [string, string][] {
    const theme = this.terminalThemeId
      ? this.#themes.get(this.terminalThemeId) ?? this.activeTheme
      : this.activeTheme;

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

  @computed get systemTheme() {
    if (this.activeThemeId == "system" && this.osNativeTheme) {
      return this.#themes.get(`lens-${this.osNativeTheme}`);
    }

    return null;
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
    await this.setNativeTheme();
    this.bindNativeThemeUpdateEvent();

    // auto-apply active theme
    reaction(() => ({
      themeId: this.activeThemeId,
      terminalThemeId: this.terminalThemeId,
    }), () => {
      try {
        this.applyActiveTheme();
      } catch (err) {
        logger.error(err);
        this.dependencies.userStore.resetTheme();
      }
    }, {
      fireImmediately: true,
      equals: comparer.shallow,
    });
  }

  bindNativeThemeUpdateEvent() {
    this.dependencies.ipcRenderer.on(setNativeThemeChannel, (event, theme: "dark" | "light") => {
      this.osNativeTheme = theme;
      this.applyActiveTheme();
    });
  }

  async setNativeTheme() {
    const theme: "dark" | "light" = await this.dependencies.ipcRenderer.invoke(getNativeThemeChannel);

    this.osNativeTheme = theme;
  }

  getThemeById(themeId: ThemeId): Theme | undefined {
    return this.#themes.get(themeId);
  }

  protected applyActiveTheme() {
    const theme = this.activeTheme;

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

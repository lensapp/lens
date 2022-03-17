/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { comparer, computed, makeObservable, observable, reaction } from "mobx";
import { autoBind, Singleton } from "./utils";
import { UserStore } from "../common/user-store";
import logger from "../main/logger";
import lensDarkTheme from "./themes/lens-dark";
import lensLightTheme from "./themes/lens-light";
import type { MonacoTheme } from "./components/monaco-editor";
import { defaultTheme } from "../common/vars";
import { camelCase } from "lodash";
import { ipcRenderer } from "electron";
import { getNativeThemeChannel, setNativeThemeChannel } from "../common/ipc/native-theme";
import type { ReadonlyDeep } from "type-fest/source/readonly-deep";

export type ThemeId = string;

export interface Theme {
  name: string;
  type: "dark" | "light";
  colors: Record<string, string>;
  description: string;
  author: string;
  monacoTheme: MonacoTheme;
}

export class ThemeStore extends Singleton {
  private terminalColorPrefix = "terminal";

  #themes = observable.map<ThemeId, Theme>({
    "lens-dark": lensDarkTheme,
    "lens-light": lensLightTheme,
  });

  @observable osNativeTheme: "dark" | "light" | undefined;

  @computed get activeThemeId(): ThemeId {
    return UserStore.getInstance().colorTheme;
  }

  @computed get terminalThemeId(): ThemeId | undefined {
    return UserStore.getInstance().terminalTheme;
  }

  @computed get activeTheme(): Theme {
    return this.systemTheme
      ?? this.#themes.get(this.activeThemeId)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ?? this.#themes.get(defaultTheme)!;
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

  constructor() {
    super();

    makeObservable(this);
    autoBind(this);
    this.init();
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
        UserStore.getInstance().resetTheme();
      }
    }, {
      fireImmediately: true,
      equals: comparer.shallow,
    });
  }

  bindNativeThemeUpdateEvent() {
    ipcRenderer.on(setNativeThemeChannel, (event, theme: "dark" | "light") => {
      this.osNativeTheme = theme;
      this.applyActiveTheme();
    });
  }

  async setNativeTheme() {
    const theme: "dark" | "light" = await ipcRenderer.invoke(getNativeThemeChannel);

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

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { comparer, computed, makeObservable, observable, reaction } from "mobx";
import { autoBind, entries, fromEntries, Singleton, startsWith } from "../utils";
import { UserStore } from "../../common/user-store";
import logger from "../../main/logger";
import lensDarkThemeJson from "./lens-dark";
import lensLightThemeJson from "./lens-light";
import { ipcRenderer } from "electron";
import { getNativeThemeChannel, setNativeThemeChannel } from "../../common/ipc/native-theme";
import { Theme, ThemeId, TerminalColors, ThemeType, terminalColorPrefix, PrefixedTerminalColorPair } from "./types";
import { camelCase } from "lodash/fp";
import assert from "assert";

const themeNameExtractor = /$(?<name>.+)-(dark|light)^/;

export const themeTypeOptions = [
  {
    value: "dark",
    label: "Dark",
  },
  {
    value: "light",
    label: "Light",
  },
];

export class ThemeStore extends Singleton {
  private themes = observable.map<ThemeId, Theme>({
    "lens-dark": lensDarkThemeJson,
    "lens-light": lensLightThemeJson,
  });

  @computed get themeNames(): string[] {
    const names = new Set<string>();

    for (const themeId of this.themes.keys()) {
      const match = themeId.match(themeNameExtractor);

      assert(match, "All ThemeId's MUST have a suffix of '-dark' or '-light'");

      names.add(match.groups.name);
    }

    return [...names];
  }

  @observable osNativeTheme: ThemeType = "dark";

  @computed get activeThemeType(): ThemeType {
    const { colorTheme } = UserStore.getInstance();

    if (colorTheme.followSystemThemeType === true) {
      return this.osNativeTheme;
    }

    return colorTheme.type;
  }

  @computed get activeThemeName(): string {
    const { colorTheme } = UserStore.getInstance();

    return colorTheme.name;
  }

  @computed get activeThemeId(): ThemeId {
    return `${this.activeThemeName}-${this.activeThemeType}`;
  }

  @computed get activeTheme(): Theme {
    return this.themes.get(this.activeThemeId) ?? lensDarkThemeJson;
  }

  @computed get activeTerminalThemeType(): ThemeType {
    const { terminalTheme } = UserStore.getInstance();

    if (terminalTheme.isGlobalThemeType === true) {
      return this.activeThemeType;
    }

    return terminalTheme.type;
  }

  @computed get activeTerminalThemeName(): string {
    const { terminalTheme } = UserStore.getInstance();

    if (terminalTheme.isGlobalTheme === true) {
      return this.activeThemeName;
    }

    return terminalTheme.name;
  }

  @computed get terminalThemeId(): ThemeId {
    return `${this.activeTerminalThemeName}-${this.activeTerminalThemeType}`;
  }

  @computed get activeTerminalTheme(): Theme {
    return this.themes.get(this.terminalThemeId) ?? lensDarkThemeJson;
  }

  @computed private get terminalThemeColors(): PrefixedTerminalColorPair[] {
    const theme = this.activeTerminalTheme;

    return entries(theme.colors)
      .filter((value): value is PrefixedTerminalColorPair => (
        startsWith(value[0], terminalColorPrefix)
      ));
  }

  @computed get xtermColors(): TerminalColors {
    return fromEntries(
      this.terminalThemeColors
        .map(([name, color]) => [
          camelCase(name.slice(terminalColorPrefix.length)) as keyof TerminalColors,
          color,
        ]),
    );
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
      theme: this.activeTheme,
      terminalTheme: this.terminalThemeColors,
    }), (themes) => {
      try {
        this.applyTheme(themes);
      } catch (err) {
        logger.error(err);
        UserStore.getInstance().resetThemeSettings();
      }
    }, {
      fireImmediately: true,
      equals: comparer.shallow,
    });
  }

  bindNativeThemeUpdateEvent() {
    ipcRenderer.on(setNativeThemeChannel, (event, theme: ThemeType) => {
      this.osNativeTheme = theme;
    });
  }

  async setNativeTheme() {
    const theme: "dark" | "light" = await ipcRenderer.invoke(getNativeThemeChannel);

    this.osNativeTheme = theme;
  }

  protected applyTheme({ theme, terminalTheme }: { theme: Theme; terminalTheme: PrefixedTerminalColorPair[] }) {
    const colors = Object.entries({
      ...theme.colors,
      ...Object.fromEntries(terminalTheme),
    });

    colors.forEach(([name, value]) => {
      document.documentElement.style.setProperty(`--${name}`, value);
    });

    // Adding universal theme flag which can be used in component styles
    document.body.classList.toggle("theme-light", theme.type === "light");
  }
}

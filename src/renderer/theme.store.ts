import { computed, observable, reaction } from "mobx";
import { autobind } from "./utils";
import { userStore } from "../common/user-store";
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

@autobind()
export class ThemeStore {
  protected styles: HTMLStyleElement;

  // bundled themes from `themes/${themeId}.json`
  @observable themes: Theme[] = [
    { id: "lens-dark", type: ThemeType.DARK },
    { id: "lens-light", type: ThemeType.LIGHT },
  ];

  @computed get activeThemeId() {
    return userStore.preferences.colorTheme;
  }

  @computed get activeTheme(): Theme {
    const activeTheme = this.themes.find(theme => theme.id === this.activeThemeId) || this.themes[0];
    return {
      colors: {},
      ...activeTheme,
    }
  }

  constructor() {
    // auto-apply active theme
    reaction(() => this.activeThemeId, async themeId => {
      try {
        await this.loadTheme(themeId);
        this.applyTheme();
      } catch (err) {
        logger.error(err);
        userStore.resetTheme();
      }
    }, {
      fireImmediately: true,
    })
  }

  async init() {
    // preload all themes
    await Promise.all(
      this.themes.map(theme => this.loadTheme(theme.id))
    );
  }

  getThemeById(themeId: ThemeId): Theme {
    return this.themes.find(theme => theme.id === themeId)
  }

  protected async loadTheme(themeId: ThemeId): Promise<Theme> {
    try {
      // todo: figure out why await import() doesn't work
      const theme = require( // eslint-disable-line @typescript-eslint/no-var-requires
        /* webpackChunkName: "themes/[name]" */
        `./themes/${themeId}.json`
      );
      const existingTheme = this.getThemeById(themeId);
      if (existingTheme) {
        Object.assign(existingTheme, theme); // merge
      }
      return existingTheme;
    } catch (err) {
      throw new Error(`Can't load theme "${themeId}": ${err}`);
    }
  }

  protected applyTheme(theme = this.activeTheme) {
    if (!this.styles) {
      this.styles = document.createElement("style");
      this.styles.id = "lens-theme"
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

export const themeStore = new ThemeStore();

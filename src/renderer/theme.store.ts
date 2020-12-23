import { computed, observable, reaction } from "mobx";
import { autobind, Singleton } from "./utils";
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

@autobind()
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
    return UserStore.getInstance().preferences.colorTheme;
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

  @autobind()
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

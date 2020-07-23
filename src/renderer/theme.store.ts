import { action, autorun, computed, observable, reaction } from "mobx";
import { autobind, createStorage } from "./utils";
import { Notifications } from "./components/notifications";
import { Theme, ThemeType } from "../common/user-store";

@autobind()
export class ThemeStore {
  protected style = document.createElement("style");

  readonly defaultTheme: Theme = {
    name: "kontena-dark",
    type: ThemeType.DARK,
    colors: {},
  };

  @observable activeThemeId = this.defaultTheme.name; // theme's filename without extension
  @observable themes = observable.map<string, Theme>([], { deep: false });

  @computed get activeTheme() {
    return this.themes.get(this.activeThemeId) || this.defaultTheme;
  }

  constructor() {
    const storage = createStorage("theme", this.activeThemeId);
    this.activeThemeId = storage.get();

    // init
    this.style.id = "lens-theme"
    document.head.prepend(this.style);
    this.setTheme(this.activeThemeId);

    // save active theme-id in local storage
    reaction(() => this.activeThemeId, themeId => storage.set(themeId), {
      fireImmediately: true
    });

    // auto-apply colors to dom from active theme
    reaction(() => this.activeTheme, this.onChange, {
      fireImmediately: true,
      delay: 150,
    });

    // apply theme from configuration
    import("./config.store").then(({ configStore }) => {
      autorun(() => {
        const themeId = configStore.config.lensTheme;
        if (themeId && themeId !== this.activeThemeId) {
          this.setTheme(themeId);
        }
      });
    })
  }

  protected onChange = (theme: Theme) => {
    let cssText = "\n"
    Object.entries(theme.colors).forEach(([propName, color]) => {
      cssText += `--${propName}: ${color} !important;\n`
    });
    this.style.textContent = `:root {${cssText}} `;
  }

  async load(themeId: string, { showErrorNotification = true } = {}): Promise<Theme> {
    if (this.themes.has(themeId)) {
      return this.themes.get(themeId);
    }
    try {
      const theme: Theme = require( // eslint-disable-line @typescript-eslint/no-var-requires
        /* webpackMode: "lazy", webpackChunkName: "theme/[request]" */
        `./themes/${themeId}.json`
      );
      this.themes.set(themeId, theme);
      return theme;
    } catch (err) {
      if (showErrorNotification) Notifications.error(err.toString());
      throw err;
    }
  }

  @action
  async setTheme(themeId = this.defaultTheme.name) {
    try {
      await this.load(themeId);
      this.activeThemeId = themeId;
    } catch (err) {
      if (themeId !== this.defaultTheme.name) {
        this.setTheme(); // fallback to default theme
      }
    }
  }
}

export const themeStore = new ThemeStore();

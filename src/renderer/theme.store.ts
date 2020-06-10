import { action, autorun, computed, observable, reaction } from "mobx";
import { autobind, createStorage } from "./utils";
import { Notifications } from "./components/notifications";

interface ITheme {
  name: string;
  type: "dark" | "light";
  author?: string;
  colors?: {
    [key: string]: string;
    blue: string;
    magenta: string;
    golden: string;
    halfGray: string;
    primary: string;
    textColorPrimary: string;
    textColorSecondary: string;
    textColorAccent: string;
    borderColor: string;
    borderFaintColor: string;
    mainBackground: string;
    contentColor: string;
    layoutBackground: string;
    layoutTabsBackground: string;
    layoutTabsActiveColor: string;
    layoutTabsLineColor: string;
    sidebarLogoBackground: string;
    sidebarActiveColor: string;
    sidebarSubmenuActiveColor: string;
    sidebarBackground: string;
    buttonPrimaryBackground: string;
    buttonDefaultBackground: string;
    buttonAccentBackground: string;
    buttonDisabledBackground: string;
    tableBgcStripe: string;
    tableBgcSelected: string;
    tableHeaderBackground: string;
    tableHeaderBorderWidth: string;
    tableHeaderBorderColor: string;
    tableHeaderColor: string;
    tableSelectedRowColor: string;
    helmLogoBackground: string;
    helmImgBackground: string;
    helmStableRepo: string;
    helmIncubatorRepo: string;
    helmDescriptionHr: string;
    helmDescriptionBlockqouteColor: string;
    helmDescriptionBlockqouteBorder: string;
    helmDescriptionBlockquoteBackground: string;
    helmDescriptionHeaders: string;
    helmDescriptionH6: string;
    helmDescriptionTdBorder: string;
    helmDescriptionTrBackground: string;
    helmDescriptionCodeBackground: string;
    helmDescriptionPreBackground: string;
    helmDescriptionPreColor: string;
    colorSuccess: string;
    colorOk: string;
    colorInfo: string;
    colorError: string;
    colorSoftError: string;
    colorWarning: string;
    colorVague: string;
    colorTerminated: string;
    dockHeadBackground: string;
    dockInfoBackground: string;
    dockInfoBorderColor: string;
    terminalBackground: string;
    terminalForeground: string;
    terminalCursor: string;
    terminalCursorAccent: string;
    terminalSelection: string;
    terminalBlack: string;
    terminalRed: string;
    terminalGreen: string;
    terminalYellow: string;
    terminalBlue: string;
    terminalMagenta: string;
    terminalCyan: string;
    terminalWhite: string;
    terminalBrightBlack: string;
    terminalBrightRed: string;
    terminalBrightGreen: string;
    terminalBrightYellow: string;
    terminalBrightBlue: string;
    terminalBrightMagenta: string;
    terminalBrightCyan: string;
    terminalBrightWhite: string;
    dialogTextColor: string;
    dialogBackground: string;
    dialogHeaderBackground: string;
    dialogFooterBackground: string;
    drawerTogglerBackground: string;
    drawerTitleText: string;
    drawerSubtitleBackground: string;
    drawerItemNameColor: string;
    drawerItemValueColor: string;
    boxShadow: string;
    iconActiveColor: string;
    iconActiveBackground: string;
    filterAreaBackground: string;
    chartLiveBarBackgound: string;
    chartStripesColor: string;
    chartCapacityColor: string;
    pieChartDefaultColor: string;
    selectOptionHoveredColor: string;
    lineProgressBackground: string;
    radioActiveBackground: string;
  };
}

@autobind()
export class ThemeStore {
  protected style = document.createElement("style");

  readonly defaultTheme: ITheme = {
    name: "kontena-dark",
    type: "dark",
    colors: {} as any,
  };

  @observable activeThemeId = this.defaultTheme.name; // theme's filename without extension
  @observable themes = observable.map<string, ITheme>([], { deep: false });

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
    reaction(() => this.activeTheme, this.onChange);

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

  protected onChange = (theme: ITheme) => {
    let cssText = "\n"
    Object.entries(theme.colors).forEach(([propName, color]) => {
      cssText += `--${propName}: ${color} !important;\n`
    });
    this.style.textContent = `:root {${cssText}} `;
  }

  async load(themeId: string, { showErrorNotification = true } = {}): Promise<ITheme> {
    if (this.themes.has(themeId)) {
      return this.themes.get(themeId);
    }
    try {
      const theme: ITheme = await import(
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
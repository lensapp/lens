/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import navigateToPreferencesInjectable from "../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import showAboutInjectable from "../menu/show-about.injectable";
import windowManagerInjectable from "../window-manager.injectable";
import trayMenuItemsInjectable from "./tray-menu-items.injectable";
import type { TrayMenuRegistration } from "./tray-menu-registration";
import { checkForUpdates, isAutoUpdateEnabled } from "../app-updater";
import logger from "../logger";
import { productName } from "../../common/vars";
import { exitApp } from "../exit-app";

const TRAY_LOG_PREFIX = "[TRAY]";

function getMenuItemConstructorOptions(trayItem: TrayMenuRegistration): Electron.MenuItemConstructorOptions {
  return {
    ...trayItem,
    submenu: trayItem.submenu ? trayItem.submenu.map(getMenuItemConstructorOptions) : undefined,
    click: trayItem.click ? () => {
      trayItem.click(trayItem);
    } : undefined,
  };
}

const trayMenuInjectable = getInjectable({
  id: "tray-menu",
  instantiate: (di) => {
    const windowManager = di.inject(windowManagerInjectable);
    const trayMenuItems = di.inject(trayMenuItemsInjectable);
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
    const showAbout = di.inject(showAboutInjectable);

    return computed((): Electron.MenuItemConstructorOptions[] => [
      {
        label: `Open ${productName}`,
        click() {
          windowManager
            .ensureMainWindow()
            .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to open lens`, { error }));
        },
      },
      {
        label: "Preferences",
        click() {
          navigateToPreferences();
        },
      },
      ...(
        isAutoUpdateEnabled()
          ? [
            {
              label: "Check for updates",
              click() {
                checkForUpdates()
                  .then(() => windowManager.ensureMainWindow());
              },
            },
          ]
          : []
      ),
      ...trayMenuItems.get().map(getMenuItemConstructorOptions),
      {
        label: `About ${productName}`,
        click() {
          windowManager.ensureMainWindow()
            .then(showAbout)
            .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to show Lens About view`, { error }));
        },
      },
      { type: "separator" } as const,
      {
        label: "Quit App",
        click() {
          exitApp();
        },
      },
    ]);
  },
});

export default trayMenuInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Menu } from "electron";
import { computed } from "mobx";
import navigateToPreferencesInjectable from "../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import { productName } from "../../common/vars";
import { checkForUpdates } from "../app-updater";
import isAutoUpdateEnabledInjectable from "../is-auto-update-enabled.injectable";
import { showAbout } from "../menu/menu";
import exitAppInjectable from "../utils/exit-app.injectable";
import ensureMainWindowInjectable from "../window/ensure-main.injectable";
import trayLoggerInjectable from "./logger.injectable";
import extensionTrayItemsInjectable from "./tray-menu-items.injectable";
import type { TrayMenuRegistration } from "./tray-menu-registration";

function getMenuItemConstructorOptions(trayItem: TrayMenuRegistration): Electron.MenuItemConstructorOptions {
  return {
    ...trayItem,
    submenu: trayItem.submenu?.map(getMenuItemConstructorOptions),
    click: trayItem.click
      ? () => {
        trayItem.click(trayItem);
      }
      : undefined,
  };
}

const trayMenuInjectable = getInjectable({
  id: "tray-menu",
  instantiate: (di) => {
    const extensionTrayItems = di.inject(extensionTrayItemsInjectable);
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
    const ensureMainWindow = di.inject(ensureMainWindowInjectable);
    const logger = di.inject(trayLoggerInjectable);
    const isAutoUpdateEnabled = di.inject(isAutoUpdateEnabledInjectable);
    const exitApp = di.inject(exitAppInjectable);

    return computed(() => Menu.buildFromTemplate([
      {
        label: `Open ${productName}`,
        click() {
          ensureMainWindow()
            .catch(error => logger.error(`Failed to open lens`, { error }));
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
                  .then(() => ensureMainWindow());
              },
            },
          ]
          : []
      ),
      ...extensionTrayItems
        .get()
        .map(getMenuItemConstructorOptions),
      {
        label: `About ${productName}`,
        click() {
          ensureMainWindow()
            .then(showAbout)
            .catch(error => logger.error(`Failed to show Lens About view`, { error }));
        },
      },
      { type: "separator" },
      {
        label: "Quit App",
        click() {
          exitApp();
        },
      },
    ]));
  },
});

export default trayMenuInjectable;

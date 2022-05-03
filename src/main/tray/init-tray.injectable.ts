/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import packageInfo from "../../../package.json";
import { Menu, Tray } from "electron";
import { autorun } from "mobx";
import { showAbout } from "../menu/menu";
import { checkForUpdates, isAutoUpdateEnabled } from "../app-updater";
import type { WindowManager } from "../window-manager";
import logger from "../logger";
import { isWindows, productName } from "../../common/vars";
import { exitApp } from "../exit-app";
import type { Disposer } from "../../common/utils";
import { disposer, toJS } from "../../common/utils";
import type { TrayMenuRegistration } from "./tray-menu-registration";
import { getInjectable } from "@ogre-tools/injectable";
import windowManagerInjectable from "../window-manager.injectable";
import navigateToPreferencesInjectable from "../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import trayMenuItemsInjectable from "./tray-menu-items.injectable";
import computedTrayIconInjectable from "./computed-tray-icon.injectable";

const initTrayInjectable = getInjectable({
  id: "init-tray",
  instantiate: (di) => {
    const windowManager = di.inject(windowManagerInjectable);
    const trayMenuItems = di.inject(trayMenuItemsInjectable);
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
    const computedTrayIcon = di.inject(computedTrayIconInjectable);

    return async (): Promise<Disposer> => {
      const tray = new Tray(await computedTrayIcon.getCurrent());

      tray.setToolTip(packageInfo.description);
      tray.setIgnoreDoubleClickEvents(true);

      if (isWindows) {
        tray.on("click", () => {
          windowManager
            .ensureMainWindow()
            .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to open lens`, { error }));
        });
      }

      return disposer(
        computedTrayIcon.subscribe(tray),
        autorun(() => {
          try {
            const menu = createTrayMenu(windowManager, toJS(trayMenuItems.get()), navigateToPreferences);

            tray.setContextMenu(menu);
          } catch (error) {
            logger.error(`${TRAY_LOG_PREFIX}: building failed`, { error });
          }
        }),
        () => tray.destroy(),
      );
    };
  },
});

export default initTrayInjectable;

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

function createTrayMenu(
  windowManager: WindowManager,
  extensionTrayItems: TrayMenuRegistration[],
  navigateToPreferences: () => void,
): Menu {
  let template: Electron.MenuItemConstructorOptions[] = [
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
  ];

  if (isAutoUpdateEnabled()) {
    template.push({
      label: "Check for updates",
      click() {
        checkForUpdates()
          .then(() => windowManager.ensureMainWindow());
      },
    });
  }

  template = template.concat(extensionTrayItems.map(getMenuItemConstructorOptions));

  return Menu.buildFromTemplate(template.concat([
    {
      label: `About ${productName}`,
      click() {
        windowManager.ensureMainWindow()
          .then(showAbout)
          .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to show Lens About view`, { error }));
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
}

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import packageInfo from "../../../package.json";
import { Menu, Tray } from "electron";
import type { IComputedValue } from "mobx";
import { autorun } from "mobx";
import { showAbout } from "../menu/menu";
import { checkForUpdates, isAutoUpdateEnabled } from "../app-updater";
import type { WindowManager } from "../window-manager";
import logger from "../logger";
import { isDevelopment, isWindows, productName, staticFilesDirectory } from "../../common/vars";
import { exitApp } from "../exit-app";
import type { Disposer } from "../../common/utils";
import { disposer, toJS } from "../../common/utils";
import type { TrayMenuRegistration } from "./tray-menu-registration";
import path from "path";


const TRAY_LOG_PREFIX = "[TRAY]";

// note: instance of Tray should be saved somewhere, otherwise it disappears
export let tray: Tray;

function getTrayIconPath(): string {
  return path.resolve(
    staticFilesDirectory,
    isDevelopment ? "../build/tray" : "icons", // copied within electron-builder extras
    "trayIconTemplate.png",
  );
}

export function initTray(
  windowManager: WindowManager,
  trayMenuItems: IComputedValue<TrayMenuRegistration[]>,
  navigateToPreferences: () => void,
): Disposer {
  const icon = getTrayIconPath();

  tray = new Tray(icon);
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
    autorun(() => {
      try {
        const menu = createTrayMenu(windowManager, toJS(trayMenuItems.get()), navigateToPreferences);

        tray.setContextMenu(menu);
      } catch (error) {
        logger.error(`${TRAY_LOG_PREFIX}: building failed`, { error });
      }
    }),
    () => {
      tray?.destroy();
      tray = null;
    },
  );
}

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

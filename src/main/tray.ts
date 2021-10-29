/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import path from "path";
import packageInfo from "../../package.json";
import { Menu, Tray } from "electron";
import { autorun } from "mobx";
import { showAbout } from "./menu";
import { checkForUpdates, isAutoUpdateEnabled } from "./app-updater";
import type { WindowManager } from "./window-manager";
import logger from "./logger";
import { isDevelopment, isWindows, productName } from "../common/vars";
import { exitApp } from "./exit-app";
import { preferencesURL } from "../common/routes";

const TRAY_LOG_PREFIX = "[TRAY]";

// note: instance of Tray should be saved somewhere, otherwise it disappears
export let tray: Tray;

export function getTrayIcon(): string {
  return path.resolve(
    __static,
    isDevelopment ? "../build/tray" : "icons", // copied within electron-builder extras
    "trayIconTemplate.png",
  );
}

export function initTray(windowManager: WindowManager) {
  const icon = getTrayIcon();

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

  const disposers = [
    autorun(() => {
      try {
        const menu = createTrayMenu(windowManager);

        tray.setContextMenu(menu);
      } catch (error) {
        logger.error(`${TRAY_LOG_PREFIX}: building failed`, { error });
      }
    }),
  ];

  return () => {
    disposers.forEach(disposer => disposer());
    tray?.destroy();
    tray = null;
  };
}

function createTrayMenu(windowManager: WindowManager): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
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
        windowManager
          .navigate(preferencesURL())
          .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to navigate to Preferences`, { error }));
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

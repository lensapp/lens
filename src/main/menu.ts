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

import { app, BrowserWindow, dialog, IpcMainEvent, Menu, MenuItem, MenuItemConstructorOptions, webContents, shell } from "electron";
import { autorun } from "mobx";
import type { WindowManager } from "./window-manager";
import { appName, isMac, isWindows, isTestEnv, docsUrl, supportUrl, productName } from "../common/vars";
import { MenuRegistry } from "../extensions/registries/menu-registry";
import logger from "./logger";
import { exitApp } from "./exit-app";
import { broadcastMessage, ipcMainOn } from "../common/ipc";
import * as packageJson from "../../package.json";
import { preferencesURL, extensionsURL, addClusterURL, catalogURL, welcomeURL } from "../common/routes";

export type MenuTopId = "mac" | "file" | "edit" | "view" | "help";

export function initMenu(windowManager: WindowManager) {
  return autorun(() => buildMenu(windowManager), {
    delay: 100
  });
}

export function showAbout(browserWindow: BrowserWindow) {
  const appInfo = [
    `${appName}: ${app.getVersion()}`,
    `Electron: ${process.versions.electron}`,
    `Chrome: ${process.versions.chrome}`,
    `Node: ${process.versions.node}`,
    packageJson.copyright,
  ];

  dialog.showMessageBoxSync(browserWindow, {
    title: `${isWindows ? " ".repeat(2) : ""}${appName}`,
    type: "info",
    buttons: ["Close"],
    message: productName,
    detail: appInfo.join("\r\n")
  });
}

export function buildMenu(windowManager: WindowManager) {
  function ignoreOnMac(menuItems: MenuItemConstructorOptions[]) {
    if (isMac) return [];

    return menuItems;
  }

  async function navigate(url: string) {
    logger.info(`[MENU]: navigating to ${url}`);
    await windowManager.navigate(url);
  }

  const macAppMenu: MenuItemConstructorOptions = {
    label: app.getName(),
    submenu: [
      {
        label: `About ${productName}`,
        click(menuItem: MenuItem, browserWindow: BrowserWindow) {
          showAbout(browserWindow);
        }
      },
      { type: "separator" },
      {
        label: "Preferences",
        accelerator: "CmdOrCtrl+,",
        click() {
          navigate(preferencesURL());
        }
      },
      {
        label: "Extensions",
        accelerator: "CmdOrCtrl+Shift+E",
        click() {
          navigate(extensionsURL());
        }
      },
      { type: "separator" },
      { role: "services" },
      { type: "separator" },
      { role: "hide" },
      { role: "hideOthers" },
      { role: "unhide" },
      { type: "separator" },
      {
        label: "Quit",
        accelerator: "Cmd+Q",
        click() {
          exitApp();
        }
      }
    ]
  };
  const fileMenu: MenuItemConstructorOptions = {
    label: "File",
    submenu: [
      {
        label: "Add Cluster",
        accelerator: "CmdOrCtrl+Shift+A",
        click() {
          navigate(addClusterURL());
        }
      },
      ...ignoreOnMac([
        { type: "separator" },
        {
          label: "Preferences",
          accelerator: "Ctrl+,",
          click() {
            navigate(preferencesURL());
          }
        },
        {
          label: "Extensions",
          accelerator: "Ctrl+Shift+E",
          click() {
            navigate(extensionsURL());
          }
        }
      ]),
      { type: "separator" },
      {
        role: "close",
        label: "Close Window"
      },
      ...ignoreOnMac([
        { type: "separator" },
        {
          label: "Exit",
          accelerator: "Alt+F4",
          click() {
            exitApp();
          }
        }
      ])
    ]
  };
  const editMenu: MenuItemConstructorOptions = {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "delete" },
      { type: "separator" },
      { role: "selectAll" },
    ]
  };
  const viewMenu: MenuItemConstructorOptions = {
    label: "View",
    submenu: [
      {
        label: "Catalog",
        accelerator: "Shift+CmdOrCtrl+C",
        click() {
          navigate(catalogURL());
        }
      },
      {
        label: "Command Palette...",
        accelerator: "Shift+CmdOrCtrl+P",
        click() {
          broadcastMessage("command-palette:open");
        }
      },
      { type: "separator" },
      {
        label: "Back",
        accelerator: "CmdOrCtrl+[",
        click() {
          webContents.getFocusedWebContents()?.goBack();
        }
      },
      {
        label: "Forward",
        accelerator: "CmdOrCtrl+]",
        click() {
          webContents.getFocusedWebContents()?.goForward();
        }
      },
      {
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click() {
          windowManager.reload();
        }
      },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" }
    ]
  };
  const helpMenu: MenuItemConstructorOptions = {
    role: "help",
    submenu: [
      {
        label: "Welcome",
        click() {
          navigate(welcomeURL());
        },
      },
      {
        label: "Documentation",
        click: async () => {
          shell.openExternal(docsUrl);
        },
      },
      {
        label: "Support",
        click: async () => {
          shell.openExternal(supportUrl);
        },
      },
      ...ignoreOnMac([
        {
          label: `About ${productName}`,
          click(menuItem: MenuItem, browserWindow: BrowserWindow) {
            showAbout(browserWindow);
          }
        }
      ])
    ]
  };
  // Prepare menu items order
  const appMenu: Record<MenuTopId, MenuItemConstructorOptions> = {
    mac: macAppMenu,
    file: fileMenu,
    edit: editMenu,
    view: viewMenu,
    help: helpMenu,
  };

  // Modify menu from extensions-api
  MenuRegistry.getInstance().getItems().forEach(({ parentId, ...menuItem }) => {
    try {
      const topMenu = appMenu[parentId as MenuTopId].submenu as MenuItemConstructorOptions[];

      topMenu.push(menuItem);
    } catch (err) {
      logger.error(`[MENU]: can't register menu item, parentId=${parentId}`, { menuItem });
    }
  });

  if (!isMac) {
    delete appMenu.mac;
  }

  const menu = Menu.buildFromTemplate(Object.values(appMenu));

  Menu.setApplicationMenu(menu);

  if (isTestEnv) {
    // this is a workaround for the test environment (spectron) not being able to directly access
    // the application menus (https://github.com/electron-userland/spectron/issues/21)
    ipcMainOn("test-menu-item-click", (event: IpcMainEvent, ...names: string[]) => {
      let menu: Menu = Menu.getApplicationMenu();
      const parentLabels: string[] = [];
      let menuItem: MenuItem;

      for (const name of names) {
        parentLabels.push(name);
        menuItem = menu?.items?.find(item => item.label === name);

        if (!menuItem) {
          break;
        }
        menu = menuItem.submenu;
      }

      const menuPath: string = parentLabels.join(" -> ");

      if (!menuItem) {
        logger.info(`[MENU:test-menu-item-click] Cannot find menu item ${menuPath}`);

        return;
      }

      const { enabled, visible, click } = menuItem;

      if (enabled === false || visible === false || typeof click !== "function") {
        logger.info(`[MENU:test-menu-item-click] Menu item ${menuPath} not clickable`);

        return;
      }

      logger.info(`[MENU:test-menu-item-click] Menu item ${menuPath} click!`);
      menuItem.click();
    });
  }
}

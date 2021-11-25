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
import { app, BrowserWindow, dialog, Menu, MenuItem, MenuItemConstructorOptions, webContents, shell } from "electron";
import { autorun, IComputedValue } from "mobx";
import type { WindowManager } from "../window-manager";
import { appName, isMac, isWindows, docsUrl, supportUrl, productName } from "../../common/vars";
import logger from "../logger";
import { exitApp } from "../exit-app";
import { broadcastMessage } from "../../common/ipc";
import * as packageJson from "../../../package.json";
import { preferencesURL, extensionsURL, addClusterURL, catalogURL, welcomeURL } from "../../common/routes";
import { checkForUpdates, isAutoUpdateEnabled } from "../app-updater";
import type { MenuRegistration } from "./menu-registration";

export type MenuTopId = "mac" | "file" | "edit" | "view" | "help";

interface MenuItemsOpts extends MenuItemConstructorOptions {
  submenu?: MenuItemConstructorOptions[];
}

export function initMenu(
  windowManager: WindowManager,
  electronMenuItems: IComputedValue<MenuRegistration[]>,
) {
  return autorun(() => buildMenu(windowManager, electronMenuItems.get()), {
    delay: 100,
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
    detail: appInfo.join("\r\n"),
  });
}

export function getAppMenu(
  windowManager: WindowManager,
  electronMenuItems: MenuRegistration[],
) {
  function ignoreIf(check: boolean, menuItems: MenuItemConstructorOptions[]) {
    return check ? [] : menuItems;
  }

  async function navigate(url: string) {
    logger.info(`[MENU]: navigating to ${url}`);
    await windowManager.navigate(url);
  }

  const autoUpdateDisabled = !isAutoUpdateEnabled();

  logger.info(`[MENU]: autoUpdateDisabled=${autoUpdateDisabled}`);

  const macAppMenu: MenuItemsOpts = {
    label: app.getName(),
    id: "root",
    submenu: [
      {
        label: `About ${productName}`,
        id: "about",
        click(menuItem: MenuItem, browserWindow: BrowserWindow) {
          showAbout(browserWindow);
        },
      },
      ...ignoreIf(autoUpdateDisabled, [{
        label: "Check for updates",
        click() {
          checkForUpdates()
            .then(() => windowManager.ensureMainWindow());
        },
      }]),
      { type: "separator" },
      {
        label: "Preferences",
        accelerator: "CmdOrCtrl+,",
        id: "preferences",
        click() {
          navigate(preferencesURL());
        },
      },
      {
        label: "Extensions",
        accelerator: "CmdOrCtrl+Shift+E",
        id: "extensions",
        click() {
          navigate(extensionsURL());
        },
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
        id: "quit",
        click() {
          exitApp();
        },
      },
    ],
  };
  const fileMenu: MenuItemsOpts = {
    label: "File",
    id: "file",
    submenu: [
      {
        label: "Add Cluster",
        accelerator: "CmdOrCtrl+Shift+A",
        id: "add-cluster",
        click() {
          navigate(addClusterURL());
        },
      },
      ...ignoreIf(isMac, [
        { type: "separator" },
        {
          label: "Preferences",
          id: "preferences",
          accelerator: "Ctrl+,",
          click() {
            navigate(preferencesURL());
          },
        },
        {
          label: "Extensions",
          accelerator: "Ctrl+Shift+E",
          click() {
            navigate(extensionsURL());
          },
        },
      ]),

      { type: "separator" },

      ...(isMac ? [
        {
          role: "close",
          label: "Close Window",
          accelerator: "Shift+Cmd+W",
        },
      ] as MenuItemConstructorOptions[] : []),

      ...ignoreIf(isMac, [
        {
          label: "Exit",
          accelerator: "Alt+F4",
          id: "quit",
          click() {
            exitApp();
          },
        },
      ]),
    ],
  };
  const editMenu: MenuItemsOpts = {
    label: "Edit",
    id: "edit",
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
    ],
  };
  const viewMenu: MenuItemsOpts = {
    label: "View",
    id: "view",
    submenu: [
      {
        label: "Catalog",
        accelerator: "Shift+CmdOrCtrl+C",
        id: "catalog",
        click() {
          navigate(catalogURL());
        },
      },
      {
        label: "Command Palette...",
        accelerator: "Shift+CmdOrCtrl+P",
        id: "command-palette",
        click(_m, _b, event) {
          /**
           * Don't broadcast unless it was triggered by menu iteration so that
           * there aren't double events in renderer
           */
          if (!event?.triggeredByAccelerator) {
            broadcastMessage("command-palette:open");
          }
        },
      },
      { type: "separator" },
      {
        label: "Back",
        accelerator: "CmdOrCtrl+[",
        id: "go-back",
        click() {
          webContents.getAllWebContents().filter(wc => wc.getType() === "window").forEach(wc => wc.goBack());
        },
      },
      {
        label: "Forward",
        accelerator: "CmdOrCtrl+]",
        id: "go-forward",
        click() {
          webContents.getAllWebContents().filter(wc => wc.getType() === "window").forEach(wc => wc.goForward());
        },
      },
      {
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        id: "reload",
        click() {
          windowManager.reload();
        },
      },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
    ],
  };
  const helpMenu: MenuItemsOpts = {
    role: "help",
    id: "help",
    submenu: [
      {
        label: "Welcome",
        id: "welcome",
        click() {
          navigate(welcomeURL());
        },
      },
      {
        label: "Documentation",
        id: "documentation",
        click: async () => {
          shell.openExternal(docsUrl);
        },
      },
      {
        label: "Support",
        id: "support",
        click: async () => {
          shell.openExternal(supportUrl);
        },
      },
      ...ignoreIf(isMac, [
        {
          label: `About ${productName}`,
          id: "about",
          click(menuItem: MenuItem, browserWindow: BrowserWindow) {
            showAbout(browserWindow);
          },
        },
        ...ignoreIf(autoUpdateDisabled, [{
          label: "Check for updates",
          click() {
            checkForUpdates()
              .then(() => windowManager.ensureMainWindow());
          },
        }]),
      ]),
    ],
  };
  // Prepare menu items order
  const appMenu = new Map([
    ["mac", macAppMenu],
    ["file", fileMenu],
    ["edit", editMenu],
    ["view", viewMenu],
    ["help", helpMenu],
  ]);

  // Modify menu from extensions-api
  for (const menuItem of electronMenuItems) {
    if (!appMenu.has(menuItem.parentId)) {
      logger.error(
        `[MENU]: cannot register menu item for parentId=${menuItem.parentId}, parent item doesn't exist`,
        { menuItem },
      );

      continue;
    }

    appMenu.get(menuItem.parentId).submenu.push(menuItem);
  }

  if (!isMac) {
    appMenu.delete("mac");
  }

  return [...appMenu.values()];

}

export function buildMenu(
  windowManager: WindowManager,
  electronMenuItems: MenuRegistration[],
) {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(getAppMenu(windowManager, electronMenuItems)),
  );
}

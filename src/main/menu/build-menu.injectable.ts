/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, webContents, shell } from "electron";
import type { WindowManager } from "../windows/manager";
import { isMac, docsUrl, supportUrl, productName } from "../../common/vars";
import logger from "../logger";
import { broadcastMessage } from "../../common/ipc";
import { preferencesURL, extensionsURL, addClusterURL, catalogURL, welcomeURL } from "../../common/routes";
import type { MenuRegistration } from "./menu-registration";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../common/utils";
import electronMenuItemsInjectable from "./electron-menu-items.injectable";
import type { IComputedValue } from "mobx";
import { showAbout } from "./show-about";
import windowManagerInjectable from "../windows/manager.injectable";
import exitAppInjectable from "../exit-app.injectable";
import { isAutoUpdateEnabled } from "../app-updater/start-update-checking.injectable";
import checkForUpdatesInjectable from "../app-updater/check-for-updates.injectable";

interface BuildMenuDependencies {
  windowManager: WindowManager;
  electronMenuItems: IComputedValue<MenuRegistration[]>;
  exitApp: () => void;
  checkForUpdates: () => Promise<void>;
}

interface MenuItemsOpts extends MenuItemConstructorOptions {
  submenu?: MenuItemConstructorOptions[];
}

function buildMenu({ windowManager, electronMenuItems, exitApp, checkForUpdates }: BuildMenuDependencies): Menu {
  function ignoreIf(check: boolean, menuItems: MenuItemConstructorOptions[]) {
    return check ? [] : menuItems;
  }

  async function navigate(url: string) {
    logger.info(`[MENU]: navigating to ${url}`);
    await windowManager.navigate(url);
  }

  const autoUpdateDisabled = !isAutoUpdateEnabled();

  logger.info(`[MENU]: auto updating is ${autoUpdateDisabled ? "disabled" : "enabled"}`);

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
           *
           * NOTE: this `?` is required because of a bug in playwright. https://github.com/microsoft/playwright/issues/10554
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
        click: () => shell.openExternal(docsUrl),
      },
      {
        label: "Support",
        id: "support",
        click: () => shell.openExternal(supportUrl),
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
  for (const menuItem of electronMenuItems.get()) {
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

  return Menu.buildFromTemplate([...appMenu.values()]);
}

const buildMenuInjectable = getInjectable({
  instantiate: (di) => bind(buildMenu, null, {
    electronMenuItems: di.inject(electronMenuItemsInjectable),
    windowManager: di.inject(windowManagerInjectable),
    exitApp: di.inject(exitAppInjectable),
    checkForUpdates: di.inject(checkForUpdatesInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default buildMenuInjectable;


/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { checkForUpdates } from "../app-updater";
import { docsUrl, productName, supportUrl } from "../../common/vars";
import { broadcastMessage } from "../../common/ipc";
import { openBrowser } from "../../common/utils";
import { showAbout } from "./menu";
import windowManagerInjectable from "../window/manager.injectable";
import type { BrowserWindow, MenuItem, MenuItemConstructorOptions } from "electron";
import { webContents } from "electron";
import appNameInjectable from "../app-paths/app-name/app-name.injectable";
import electronMenuItemsInjectable from "./electron-menu-items.injectable";
import isAutoUpdateEnabledInjectable from "../is-auto-update-enabled.injectable";
import navigateToPreferencesInjectable from "../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import navigateToExtensionsInjectable from "../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";
import navigateToCatalogInjectable from "../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToWelcomeInjectable from "../../common/front-end-routing/routes/welcome/navigate-to-welcome.injectable";
import navigateToAddClusterInjectable from "../../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";
import isMacInjectable from "../../common/vars/is-mac.injectable";
import { computed } from "mobx";
import appMenuLoggerInjectable from "./logger.injectable";
import exitAppInjectable from "../utils/exit-app.injectable";

function ignoreIf(check: boolean, menuItems: MenuItemConstructorOptions[]) {
  return check ? [] : menuItems;
}

export interface MenuItemOpts extends MenuItemConstructorOptions {
  submenu?: MenuItemConstructorOptions[];
}

const applicationMenuItemsInjectable = getInjectable({
  id: "application-menu-items",

  instantiate: (di) => {
    const logger = di.inject(appMenuLoggerInjectable);
    const appName = di.inject(appNameInjectable);
    const isMac = di.inject(isMacInjectable);
    const isAutoUpdateEnabled = di.inject(isAutoUpdateEnabledInjectable);
    const electronMenuItems = di.inject(electronMenuItemsInjectable);
    const windowManager = di.inject(windowManagerInjectable);
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
    const navigateToExtensions = di.inject(navigateToExtensionsInjectable);
    const navigateToCatalog = di.inject(navigateToCatalogInjectable);
    const navigateToWelcome = di.inject(navigateToWelcomeInjectable);
    const navigateToAddCluster = di.inject(navigateToAddClusterInjectable);
    const exitApp = di.inject(exitAppInjectable);
    const autoUpdateDisabled = !isAutoUpdateEnabled();

    return computed((): MenuItemOpts[] => {
      logger.info(`auto update is ${autoUpdateDisabled ? "disabled" : "enabled"}`);

      const macAppMenu: MenuItemOpts = {
        label: appName,
        id: "root",
        submenu: [
          {
            label: `About ${productName}`,
            id: "about",
            click(menuItem: MenuItem, browserWindow: BrowserWindow) {
              showAbout(browserWindow);
            },
          },
          ...ignoreIf(autoUpdateDisabled, [
            {
              label: "Check for updates",
              click() {
                checkForUpdates().then(() => windowManager.ensureMainWindow());
              },
            },
          ]),
          { type: "separator" },
          {
            label: "Preferences",
            accelerator: "CmdOrCtrl+,",
            id: "preferences",
            click() {
              navigateToPreferences();
            },
          },
          {
            label: "Extensions",
            accelerator: "CmdOrCtrl+Shift+E",
            id: "extensions",
            click() {
              navigateToExtensions();
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
      const fileMenu: MenuItemOpts = {
        label: "File",
        id: "file",
        submenu: [
          {
            label: "Add Cluster",
            accelerator: "CmdOrCtrl+Shift+A",
            id: "add-cluster",
            click() {
              navigateToAddCluster();
            },
          },
          ...ignoreIf(isMac, [
            { type: "separator" },
            {
              label: "Preferences",
              id: "preferences",
              accelerator: "Ctrl+,",
              click() {
                navigateToPreferences();
              },
            },
            {
              label: "Extensions",
              accelerator: "Ctrl+Shift+E",
              click() {
                navigateToExtensions();
              },
            },
          ]),

          { type: "separator" },

          ...(isMac
            ? ([
              {
                role: "close",
                label: "Close Window",
                accelerator: "Shift+Cmd+W",
              },
            ] as MenuItemConstructorOptions[])
            : []),

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
      const editMenu: MenuItemOpts = {
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
      const viewMenu: MenuItemOpts = {
        label: "View",
        id: "view",
        submenu: [
          {
            label: "Catalog",
            accelerator: "Shift+CmdOrCtrl+C",
            id: "catalog",
            click() {
              navigateToCatalog();
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
              webContents
                .getAllWebContents()
                .filter((wc) => wc.getType() === "window")
                .forEach((wc) => wc.goBack());
            },
          },
          {
            label: "Forward",
            accelerator: "CmdOrCtrl+]",
            id: "go-forward",
            click() {
              webContents
                .getAllWebContents()
                .filter((wc) => wc.getType() === "window")
                .forEach((wc) => wc.goForward());
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
      const helpMenu: MenuItemOpts = {
        role: "help",
        id: "help",
        submenu: [
          {
            label: "Welcome",
            id: "welcome",
            click() {
              navigateToWelcome();
            },
          },
          {
            label: "Documentation",
            id: "documentation",
            click: async () => {
              openBrowser(docsUrl).catch((error) => {
                logger.error("failed to open browser", { error });
              });
            },
          },
          {
            label: "Support",
            id: "support",
            click: async () => {
              openBrowser(supportUrl).catch((error) => {
                logger.error("failed to open browser", { error });
              });
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
            ...ignoreIf(autoUpdateDisabled, [
              {
                label: "Check for updates",
                click() {
                  checkForUpdates().then(() =>
                    windowManager.ensureMainWindow(),
                  );
                },
              },
            ]),
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
            `cannot register menu item for parentId=${menuItem.parentId}, parent item doesn't exist`,
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
    });
  },
});

export default applicationMenuItemsInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { docsUrl, productName, supportUrl } from "../../common/vars";
import { broadcastMessage } from "../../common/ipc";
import type { MenuItemConstructorOptions } from "electron";
import { webContents } from "electron";
import loggerInjectable from "../../common/logger.injectable";
import appNameInjectable from "../app-paths/app-name/app-name.injectable";
import electronMenuItemsInjectable from "./electron-menu-items.injectable";
import updatingIsEnabledInjectable from "../application-update/updating-is-enabled.injectable";
import navigateToPreferencesInjectable from "../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import navigateToExtensionsInjectable from "../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";
import navigateToCatalogInjectable from "../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToWelcomeInjectable from "../../common/front-end-routing/routes/welcome/navigate-to-welcome.injectable";
import navigateToAddClusterInjectable from "../../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";
import stopServicesAndExitAppInjectable from "../stop-services-and-exit-app.injectable";
import isMacInjectable from "../../common/vars/is-mac.injectable";
import { computed } from "mobx";
import showAboutInjectable from "./show-about.injectable";
import reloadCurrentApplicationWindowInjectable from "../start-main-application/lens-window/reload-current-application-window.injectable";
import showApplicationWindowInjectable from "../start-main-application/lens-window/show-application-window.injectable";
import processCheckingForUpdatesInjectable from "../application-update/check-for-updates/process-checking-for-updates.injectable";
import openLinkInBrowserInjectable from "../../common/utils/open-link-in-browser.injectable";

function ignoreIf(check: boolean, menuItems: MenuItemOpts[]) {
  return check ? [] : menuItems;
}

export interface MenuItemOpts extends MenuItemConstructorOptions {
  submenu?: MenuItemConstructorOptions[];
}

const applicationMenuItemsInjectable = getInjectable({
  id: "application-menu-items",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);
    const appName = di.inject(appNameInjectable);
    const isMac = di.inject(isMacInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);
    const electronMenuItems = di.inject(electronMenuItemsInjectable);
    const showAbout = di.inject(showAboutInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const reloadApplicationWindow = di.inject(reloadCurrentApplicationWindowInjectable);
    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
    const navigateToExtensions = di.inject(navigateToExtensionsInjectable);
    const navigateToCatalog = di.inject(navigateToCatalogInjectable);
    const navigateToWelcome = di.inject(navigateToWelcomeInjectable);
    const navigateToAddCluster = di.inject(navigateToAddClusterInjectable);
    const stopServicesAndExitApp = di.inject(stopServicesAndExitAppInjectable);
    const processCheckingForUpdates = di.inject(processCheckingForUpdatesInjectable);
    const openLinkInBrowser = di.inject(openLinkInBrowserInjectable);

    logger.info(`[MENU]: autoUpdateEnabled=${updatingIsEnabled}`);

    return computed((): MenuItemOpts[] => {
      const macAppMenu: MenuItemOpts = {
        label: appName,
        id: "root",
        submenu: [
          {
            label: `About ${productName}`,
            id: "about",
            click() {
              showAbout();
            },
          },
          ...ignoreIf(!updatingIsEnabled, [
            {
              id: "check-for-updates",
              label: "Check for updates",
              click() {
                processCheckingForUpdates("application-menu").then(() => showApplicationWindow());
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
              stopServicesAndExitApp();
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
          ...ignoreIf(!isMac, [
            {
              role: "close",
              label: "Close Window",
              accelerator: "Shift+Cmd+W",
            },
          ]),
          ...ignoreIf(isMac, [
            {
              label: "Exit",
              accelerator: "Alt+F4",
              id: "quit",
              click() {
                stopServicesAndExitApp();
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
              reloadApplicationWindow();
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
              openLinkInBrowser(docsUrl).catch((error) => {
                logger.error("[MENU]: failed to open browser", { error });
              });
            },
          },
          {
            label: "Support",
            id: "support",
            click: async () => {
              openLinkInBrowser(supportUrl).catch((error) => {
                logger.error("[MENU]: failed to open browser", { error });
              });
            },
          },
          ...ignoreIf(isMac, [
            {
              label: `About ${productName}`,
              id: "about",
              click() {
                showAbout();
              },
            },
            ...ignoreIf(!updatingIsEnabled, [
              {
                label: "Check for updates",
                click() {
                  processCheckingForUpdates("periodic").then(() =>
                    showApplicationWindow(),
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
        const parentMenu = appMenu.get(menuItem.parentId);

        if (!parentMenu) {
          logger.error(
            `[MENU]: cannot register menu item for parentId=${menuItem.parentId}, parent item doesn't exist`,
            { menuItem },
          );

          continue;
        }

        (parentMenu.submenu ??= []).push(menuItem);
      }

      if (!isMac) {
        appMenu.delete("mac");
      }

      return [...appMenu.values()];
    });
  },
});

export default applicationMenuItemsInjectable;

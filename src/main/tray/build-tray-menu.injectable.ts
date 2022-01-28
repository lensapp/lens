/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../common/utils";
import { Menu, MenuItemConstructorOptions } from "electron";
import type { IComputedValue } from "mobx";
import type { WindowManager } from "../windows/manager";
import { productName } from "../../common/vars";
import { preferencesURL } from "../../common/routes";
import type { TrayMenuRegistration } from "./tray-menu-registration";
import { showAbout } from "../menu/show-about";
import type { LensLogger } from "../../common/logger";
import exitAppInjectable from "../exit-app.injectable";
import trayLoggerInjectable from "./tray-logger.injectable";
import trayMenuItemsInjectable from "./tray-menu-items.injectable";
import windowManagerInjectable from "../windows/manager.injectable";
import { isAutoUpdateEnabled } from "../app-updater/start-update-checking.injectable";
import checkForUpdatesInjectable from "../app-updater/check-for-updates.injectable";

interface Dependencies {
  windowManager: WindowManager;
  trayMenuItems: IComputedValue<TrayMenuRegistration[]>;
  exitApp: () => void;
  logger: LensLogger;
  checkForUpdates: () => Promise<void>;
}

function getMenuItemConstructorOptions(trayItem: TrayMenuRegistration): MenuItemConstructorOptions {
  return {
    ...trayItem,
    submenu: trayItem.submenu ? trayItem.submenu.map(getMenuItemConstructorOptions) : undefined,
    click: trayItem.click
      ? () => void trayItem.click(trayItem)
      : undefined,
  };
}

function ignoreIf(check: boolean, menuItems: MenuItemConstructorOptions[]) {
  return check ? [] : menuItems;
}

function buildTrayMenu({ windowManager, trayMenuItems, exitApp, logger, checkForUpdates }: Dependencies) {
  const template: MenuItemConstructorOptions[] = [
    {
      label: `Open ${productName}`,
      click() {
        windowManager
          .ensureMainWindow()
          .catch(error => logger.error(`Failed to open lens`, { error }));
      },
    },
    {
      label: "Preferences",
      click() {
        windowManager
          .navigate(preferencesURL())
          .catch(error => logger.error(`Failed to navigate to Preferences`, { error }));
      },
    },
    ...ignoreIf(!isAutoUpdateEnabled(), [
      {
        label: "Check for updates",
        click() {
          checkForUpdates()
            .then(() => windowManager.ensureMainWindow());
        },
      },
    ]),
    ...trayMenuItems.get().map(getMenuItemConstructorOptions),
    {
      label: `About ${productName}`,
      click() {
        windowManager.ensureMainWindow()
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
  ];

  return Menu.buildFromTemplate(template);
}

const buildTrayMenuInjectable = getInjectable({
  instantiate: (di) => bind(buildTrayMenu, null, {
    exitApp: di.inject(exitAppInjectable),
    logger: di.inject(trayLoggerInjectable),
    trayMenuItems: di.inject(trayMenuItemsInjectable),
    windowManager: di.inject(windowManagerInjectable),
    checkForUpdates: di.inject(checkForUpdatesInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default buildTrayMenuInjectable;

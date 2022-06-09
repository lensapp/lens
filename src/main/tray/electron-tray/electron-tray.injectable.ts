/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Menu, Tray } from "electron";
import packageJsonInjectable from "../../../common/vars/package-json.injectable";
import showApplicationWindowInjectable from "../../start-main-application/lens-window/show-application-window.injectable";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import trayIconPathsInjectable from "../tray-icon-path.injectable";
import type { TrayMenuItem } from "../tray-menu-item/tray-menu-item-injection-token";
import { convertToElectronMenuTemplate } from "../reactive-tray-menu-items/converters";

const TRAY_LOG_PREFIX = "[TRAY]";

export interface ElectronTray {
  start(): void;
  stop(): void;
  setMenuItems(menuItems: TrayMenuItem[]): void;
  setIconPath(iconPath: string): void;
}

const electronTrayInjectable = getInjectable({
  id: "electron-tray",

  instantiate: (di): ElectronTray => {
    const packageJson = di.inject(packageJsonInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const isWindows = di.inject(isWindowsInjectable);
    const logger = di.inject(loggerInjectable);
    const trayIconPaths = di.inject(trayIconPathsInjectable);

    let tray: Tray;

    return {
      start: () => {
        tray = new Tray(trayIconPaths.normal);

        tray.setToolTip(packageJson.description);
        tray.setIgnoreDoubleClickEvents(true);

        if (isWindows) {
          tray.on("click", () => {
            showApplicationWindow()
              .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to open lens`, { error }));
          });
        }
      },
      stop: () => {
        tray.destroy();
      },
      setMenuItems: (menuItems) => {
        const template = convertToElectronMenuTemplate(menuItems);
        const menu = Menu.buildFromTemplate(template);

        tray.setContextMenu(menu);
      },
      setIconPath: (iconPath) => {
        tray.setImage(iconPath);
      },
    };
  },

  causesSideEffects: true,
});

export default electronTrayInjectable;

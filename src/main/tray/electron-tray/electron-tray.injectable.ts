/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { Menu, Tray } from "electron";
import packageJsonInjectable from "../../../common/vars/package-json.injectable";
import logger from "../../logger";
import { TRAY_LOG_PREFIX } from "../tray";
import showApplicationWindowInjectable from "../../start-main-application/lens-window/show-application-window.injectable";
import type { TrayMenuItem } from "../tray-menu-item/tray-menu-item-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { isEmpty, map, filter } from "lodash/fp";
import isWindowsInjectable from "../../../common/vars/is-windows.injectable";
import loggerInjectable from "../../../common/logger.injectable";
import trayIconPathInjectable from "../tray-icon-path.injectable";

const electronTrayInjectable = getInjectable({
  id: "electron-tray",

  instantiate: (di) => {
    const packageJson = di.inject(packageJsonInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const isWindows = di.inject(isWindowsInjectable);
    const logger = di.inject(loggerInjectable);
    const trayIconPath = di.inject(trayIconPathInjectable);

    let tray: Tray;

    return {
      start: () => {
        tray = new Tray(trayIconPath);

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

      setMenuItems: (items: TrayMenuItem[]) => {
        pipeline(
          items,
          convertToElectronMenuTemplate,
          Menu.buildFromTemplate,

          (template) => {
            tray.setContextMenu(template);
          },
        );
      },
    };
  },

  causesSideEffects: true,
});

export default electronTrayInjectable;

const convertToElectronMenuTemplate = (trayMenuItems: TrayMenuItem[]) => {
  const _toTrayMenuOptions = (parentId: string | null) =>
    pipeline(
      trayMenuItems,

      filter((item) => item.parentId === parentId),

      map(
        (trayMenuItem: TrayMenuItem): Electron.MenuItemConstructorOptions => {
          if (trayMenuItem.separator) {
            return { id: trayMenuItem.id, type: "separator" };
          }

          const childItems = _toTrayMenuOptions(trayMenuItem.id);

          return {
            id: trayMenuItem.id,
            label: trayMenuItem.label?.get(),
            enabled: trayMenuItem.enabled.get(),
            toolTip: trayMenuItem.tooltip,

            ...(isEmpty(childItems)
              ? {
                type: "normal",
                submenu: _toTrayMenuOptions(trayMenuItem.id),

                click: () => {
                  try {
                    trayMenuItem.click?.();
                  } catch (error) {
                    logger.error(
                      `${TRAY_LOG_PREFIX}: clicking item "${trayMenuItem.id} failed."`,
                      { error },
                    );
                  }
                },
              }
              : {
                type: "submenu",
                submenu: _toTrayMenuOptions(trayMenuItem.id),
              }),

          };
        },
      ),
    );

  return _toTrayMenuOptions(null);
};

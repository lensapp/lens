/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import loggerInjectable from "../../../common/logger.injectable";
import type { TrayMenuItem } from "../tray-menu-item/tray-menu-item-injection-token";

const convertToElectronMenuTemplateInjectable = getInjectable({
  id: "convert-to-electron-menu-template",
  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    return (trayMenuItems: TrayMenuItem[]) => {
      const toTrayMenuOptions = (parentId: string | null) => (
        trayMenuItems
          .filter((item) => item.parentId === parentId)
          .map((trayMenuItem: TrayMenuItem): Electron.MenuItemConstructorOptions => {
            if (trayMenuItem.separator) {
              return { id: trayMenuItem.id, type: "separator" };
            }

            const childItems = toTrayMenuOptions(trayMenuItem.id);

            return {
              id: trayMenuItem.id,
              label: trayMenuItem.label?.get(),
              enabled: trayMenuItem.enabled.get(),
              toolTip: trayMenuItem.tooltip,

              ...(childItems.length === 0
                ? {
                  type: "normal",
                  submenu: toTrayMenuOptions(trayMenuItem.id),

                  click: () => {
                    (async () => {
                      try {
                        await trayMenuItem.click?.();
                      } catch (error) {
                        logger.error(
                          `[TRAY]: clicking item "${trayMenuItem.id} failed."`,
                          { error },
                        );
                      }
                    })();
                  },
                }
                : {
                  type: "submenu",
                  submenu: toTrayMenuOptions(trayMenuItem.id),
                }),

            };
          })
      );

      return toTrayMenuOptions(null);
    };
  },
});

export default convertToElectronMenuTemplateInjectable;

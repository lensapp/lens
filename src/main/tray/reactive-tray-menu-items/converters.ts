/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { TrayMenuItem } from "../tray-menu-item/tray-menu-item-injection-token";

export function convertToElectronMenuTemplate(trayMenuItems: TrayMenuItem[]): Electron.MenuItemConstructorOptions[] {
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
              click: trayMenuItem.click,
            }
            : {
              type: "submenu",
              submenu: toTrayMenuOptions(trayMenuItem.id),
            }),

        };
      })
  );

  return toTrayMenuOptions(null);
}

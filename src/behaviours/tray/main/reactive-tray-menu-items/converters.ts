/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { MinimalTrayMenuItem } from "../electron-tray/electron-tray.injectable";

export function convertToElectronMenuTemplate(trayMenuItems: MinimalTrayMenuItem[]): Electron.MenuItemConstructorOptions[] {
  const toTrayMenuOptions = (parentId: string | null) => (
    trayMenuItems
      .filter((item) => item.parentId === parentId)
      .map((trayMenuItem): Electron.MenuItemConstructorOptions => {
        if (trayMenuItem.separator) {
          return { id: trayMenuItem.id, type: "separator" };
        }

        const childItems = toTrayMenuOptions(trayMenuItem.id);

        return {
          id: trayMenuItem.id,
          label: trayMenuItem.label,
          enabled: trayMenuItem.enabled,
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

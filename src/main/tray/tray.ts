/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import packageInfo from "../../../package.json";
import { Menu, Tray } from "electron";
import type { IComputedValue } from "mobx";
import { autorun } from "mobx";
import logger from "../logger";
import { isWindows } from "../../common/vars";
import type { Disposer } from "../../common/utils";
import { disposer } from "../../common/utils";
import type { TrayMenuItem } from "./tray-menu-item/tray-menu-item-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { filter, isEmpty, map } from "lodash/fp";

export const TRAY_LOG_PREFIX = "[TRAY]";

// note: instance of Tray should be saved somewhere, otherwise it disappears
export let tray: Tray | null = null;

export function initTray(
  trayMenuItems: IComputedValue<TrayMenuItem[]>,
  showApplicationWindow: () => Promise<void>,
  trayIconPath: string,
): Disposer {
  tray = new Tray(trayIconPath);
  tray.setToolTip(packageInfo.description);
  tray.setIgnoreDoubleClickEvents(true);

  if (isWindows) {
    tray.on("click", () => {
      showApplicationWindow()
        .catch(error => logger.error(`${TRAY_LOG_PREFIX}: Failed to open lens`, { error }));
    });
  }

  return disposer(
    autorun(() => {
      try {
        const options = toTrayMenuOptions(trayMenuItems.get());

        const menu = Menu.buildFromTemplate(options);

        tray?.setContextMenu(menu);
      } catch (error) {
        logger.error(`${TRAY_LOG_PREFIX}: building failed`, { error });
      }
    }),
    () => {
      tray?.destroy();
      tray = null;
    },
  );
}

const toTrayMenuOptions = (trayMenuItems: TrayMenuItem[]) => {
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
                  trayMenuItem.click?.();
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


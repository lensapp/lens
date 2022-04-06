/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Menu } from "electron";
import type { IComputedValue } from "mobx";
import { autorun } from "mobx";
import type { MenuItemOpts } from "./application-menu-items.injectable";

export type MenuTopId = "mac" | "file" | "edit" | "view" | "help";

export function initMenu(
  applicationMenuItems: IComputedValue<MenuItemOpts[]>,
) {
  return autorun(() => buildMenu(applicationMenuItems.get()), {
    delay: 100,
  });
}

export function buildMenu(
  applicationMenuItems: MenuItemOpts[],
) {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate(applicationMenuItems),
  );
}

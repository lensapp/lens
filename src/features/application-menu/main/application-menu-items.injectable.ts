/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MenuItemConstructorOptions } from "electron";
import { computed } from "mobx";
import type { ApplicationMenuItemTypes } from "./menu-items/application-menu-item-injection-token";
import applicationMenuItemInjectionToken from "./menu-items/application-menu-item-injection-token";
import { filter, map, sortBy } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";
import type { Composite } from "./menu-items/get-composite/get-composite";
import getComposite from "./menu-items/get-composite/get-composite";

export interface MenuItemOpts extends MenuItemConstructorOptions {
  submenu?: MenuItemConstructorOptions[];
}

const applicationMenuItemsInjectable = getInjectable({
  id: "application-menu-items",

  instantiate: (di) => {
    const allShown = pipeline(
      di.injectMany(applicationMenuItemInjectionToken),
      filter((x) => x.isShown !== false),
    );

    const roots = allShown.filter((x) => x.parentId === null);

    const toMenuItemOpt = (
      x: Composite<ApplicationMenuItemTypes>,
    ): MenuItemOpts => ({
      // @ts-ignore
      label: x.value.label,
      id: x.id,

      submenu: pipeline(
        x.children,
        sortBy(x => x.value.orderNumber),
        map(toMenuItemOpt),
      ),

      // @ts-ignore
      type: x.value.type,
      // @ts-ignore
      role: x.value.role,
      // @ts-ignore
      click: x.value.click,
      // @ts-ignore
      accelerator: x.value.accelerator,
    });

    const menuItems = pipeline(
      roots,

      map((root) =>
        getComposite({
          source: allShown,
          // @ts-ignore
          rootId: root.id,
          // @ts-ignore
          getId: (x) => x.id,
          // @ts-ignore
          getParentId: (x) => x.parentId,
        }),
      ),

      map(toMenuItemOpt),
    );

    return computed((): MenuItemOpts[] => {
      // Prepare menu items order

      // // Modify menu from extensions-api
      // for (const menuItem of electronMenuItems.get()) {
      //   const parentMenu = appMenu.get(menuItem.parentId);
      //
      //   if (!parentMenu) {
      //     logger.error(
      //       `[MENU]: cannot register menu item for parentId=${menuItem.parentId}, parent item doesn't exist`,
      //       { menuItem },
      //     );
      //
      //     continue;
      //   }
      //
      //   // (parentMenu.submenu ??= []).push(menuItem);
      // }

      return menuItems;
    });
  },
});

export default applicationMenuItemsInjectable;

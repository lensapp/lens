/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MenuItemConstructorOptions } from "electron";
import { computed } from "mobx";
import applicationMenuItemInjectionToken, { isShown } from "./menu-items/application-menu-item-injection-token";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";

export interface MenuItemOpts extends MenuItemConstructorOptions {
  submenu?: MenuItemConstructorOptions[];
}

const applicationMenuItemsInjectable = getInjectable({
  id: "application-menu-items",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);

    return computed(() =>
      computedInjectMany(applicationMenuItemInjectionToken)
        .get()
        .filter(isShown),
    );

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
  },
});


export default applicationMenuItemsInjectable;

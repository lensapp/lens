/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getStartableStoppable } from "../../../common/utils/get-startable-stoppable";
import { reaction } from "mobx";
import electronTrayInjectable from "../electron-tray/electron-tray.injectable";
import trayMenuItemsInjectable from "../tray-menu-item/tray-menu-items.injectable";

const reactiveTrayMenuItemsInjectable = getInjectable({
  id: "reactive-tray-menu-items",

  instantiate: (di) => {
    const electronTray = di.inject(electronTrayInjectable);
    const trayMenuItems = di.inject(trayMenuItemsInjectable);

    return getStartableStoppable("reactive-tray-menu-items", () => (
      reaction(
        () => trayMenuItems.get(),
        electronTray.setMenuItems,
        {
          fireImmediately: true,
        },
      )
    ));
  },
});

export default reactiveTrayMenuItemsInjectable;

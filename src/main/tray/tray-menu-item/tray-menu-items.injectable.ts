/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";
import { trayMenuItemInjectionToken } from "./tray-menu-item-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { filter, sortBy } from "lodash/fp";

const trayMenuItemsInjectable = getInjectable({
  id: "tray-menu-items",

  instantiate: (di) => {
    const computedInjectMany = di.inject(
      computedInjectManyInjectable,
    );

    const reactiveMenuItems = computedInjectMany(trayMenuItemInjectionToken);

    return computed(() =>
      pipeline(
        reactiveMenuItems.get(),
        filter((item) => item.visible.get()),
        (items) => sortBy("orderNumber", items),
      ),
    );
  },
});

export default trayMenuItemsInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed } from "mobx";
import { getInjectable } from "@ogre-tools/injectable";
import sidebarItemsInjectable from "../components/layout/sidebar-items.injectable";

const siblingTabsInjectable = getInjectable({
  id: "sibling-tabs",

  instantiate: (di) => {
    const sidebarItems = di.inject(sidebarItemsInjectable);

    return computed(() => {
      const item = sidebarItems.get().find(({ isActive }) => isActive.get());

      return item?.children ?? [];
    });
  },
});

export default siblingTabsInjectable;

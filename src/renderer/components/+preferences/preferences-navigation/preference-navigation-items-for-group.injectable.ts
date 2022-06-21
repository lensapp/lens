/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import {
  getInjectable,
  lifecycleEnum,
} from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { PreferenceNavigationItem } from "./preference-navigation-items.injectable";
import preferenceNavigationItemsInjectable from "./preference-navigation-items.injectable";

const preferenceNavigationItemsForGroupInjectable = getInjectable({
  id: "preference-navigation-items-for-group",

  instantiate: (di, group: string) => {
    const preferenceNavigationItems = di.inject(preferenceNavigationItemsInjectable);

    return computed((): PreferenceNavigationItem[] =>
      preferenceNavigationItems.get().filter((item) => item.parent == group),
    );
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, group: string) => group,
  }),
});

export default preferenceNavigationItemsForGroupInjectable;


/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { filter, orderBy } from "lodash/fp";
import { computed } from "mobx";
import type { PreferenceNavigationItem } from "./preference-navigation-items.injectable";
import { preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";

const extensionsPreferenceNavigationItemsInjectable = getInjectable({
  id: "extension-preference-navigation-items",

  instantiate: (di) =>
    computed((): PreferenceNavigationItem[] =>
      pipeline(
        di.injectMany(preferenceNavigationItemInjectionToken),
        filter((item) => !!item.isVisible.get()),
        filter((item) => item.parent == "extensions"),
        (items) => orderBy([(item) => item.orderNumber], ["asc"], items),
      ),
    ),
});

export default extensionsPreferenceNavigationItemsInjectable;
 

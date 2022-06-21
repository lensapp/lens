/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { filter, orderBy } from "lodash/fp";
import { computed } from "mobx";
import { PreferenceNavigationItem, preferenceNavigationItemInjectionToken } from "./preference-navigation-items.injectable";

const generalPreferenceNavigationItemsInjectable = getInjectable({
  id: "general-preference-navigation-items",

  instantiate: (di) =>
    computed((): PreferenceNavigationItem[] =>
      pipeline(
        di.injectMany(preferenceNavigationItemInjectionToken),
        filter((item) => !!item.isVisible.get()),
        filter((item) => !item.parent),
        (items) => orderBy([(item) => item.orderNumber], ["asc"], items),
      ),
    ),
});

export default generalPreferenceNavigationItemsInjectable;
 
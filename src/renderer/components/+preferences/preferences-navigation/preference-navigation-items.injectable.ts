/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { filter, orderBy } from "lodash/fp";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";

export const preferenceNavigationItemInjectionToken =
  getInjectionToken<PreferenceNavigationItem>({
    id: "preference-navigation-item-injection-token",
  });

export interface PreferenceNavigationItem {
  id: string;
  label: string;
  isActive: IComputedValue<boolean>;
  isVisible: IComputedValue<boolean>;
  navigate: () => void;
  orderNumber: number;
  parent: string;
}

const preferenceNavigationItemsInjectable = getInjectable({
  id: "preference-navigation-items",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const navigationItems = computedInjectMany(preferenceNavigationItemInjectionToken);

    return computed((): PreferenceNavigationItem[] =>
      pipeline(
        navigationItems.get(),
        filter((item) => !!item.isVisible.get()),
        (items) => orderBy([(item) => item.orderNumber], ["asc"], items),
      ),
    );
  },
});

export default preferenceNavigationItemsInjectable;

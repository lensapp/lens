/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
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
}

const preferenceNavigationItemsInjectable = getInjectable({
  id: "preference-navigation-items",

  instantiate: (di) =>
    computed((): PreferenceNavigationItem[] =>
      pipeline(
        di.injectMany(preferenceNavigationItemInjectionToken),
        filter((item) => !!item.isVisible.get()),
        (items) => orderBy([(item) => item.orderNumber], ["asc"], items),
      ),
    ),
});

export default preferenceNavigationItemsInjectable;

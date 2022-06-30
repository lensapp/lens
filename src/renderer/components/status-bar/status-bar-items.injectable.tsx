/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { StatusBarItemProps } from "./status-bar-registration";
import type { StatusBarItem } from "./status-bar-item-injection-token";
import { statusBarItemInjectionToken } from "./status-bar-item-injection-token";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";

export interface StatusBarItems {
  right: React.ComponentType<StatusBarItemProps>[];
  left: React.ComponentType<StatusBarItemProps>[];
}

interface Dependencies {
  registrations: IComputedValue<StatusBarItem[]>;
}

function getStatusBarItems({ registrations }: Dependencies): IComputedValue<StatusBarItems> {
  return computed(() => {
    const res: StatusBarItems = {
      left: [],
      right: [],
    };

    for (const registration of registrations.get()) {
      const { position = "right", component, visible } = registration;

      if (!visible.get()) {
        continue;
      }

      res[position].push(component);
    }

    // This is done so that the first ones registered are closest to the corner
    res.right.reverse();

    return res;
  });
}

const statusBarItemsInjectable = getInjectable({
  id: "status-bar-items",

  instantiate: (di) => {
    const computedInjectMany = di.inject(
      computedInjectManyInjectable,
    );

    return getStatusBarItems({
      registrations: computedInjectMany(statusBarItemInjectionToken),
    });
  },

});

export default statusBarItemsInjectable;

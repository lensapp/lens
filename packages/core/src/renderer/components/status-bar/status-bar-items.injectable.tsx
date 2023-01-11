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

interface StatusItem {
  origin?: string;
  component: React.ComponentType<StatusBarItemProps>;
}

export interface StatusBarItems {
  right: StatusItem[];
  left: StatusItem[];
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
      const { position = "right", component, visible, origin } = registration;

      if (!visible.get()) {
        continue;
      }

      res[position].push({
        origin,
        component,
      });
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

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { StatusBarItemProps } from "./status-bar-registration";
import { StatusBarItem, statusBarItemInjectionToken } from "./status-bar-item-injection-token";

export interface StatusBarItems {
  right: React.ComponentType<StatusBarItemProps>[];
  left: React.ComponentType<StatusBarItemProps>[];
}

interface Dependencies {
  registrations: StatusBarItem[];
}

function getStatusBarItems({ registrations }: Dependencies): IComputedValue<StatusBarItems> {
  return computed(() => {
    const res: StatusBarItems = {
      left: [],
      right: [],
    };

    for (const registration of registrations) {
      if (!registration || typeof registration !== "object") {
        continue;
      }

      const { position = "right", component } = registration;

      if (position !== "left" && position !== "right") {
        throw new TypeError("StatusBarRegistration.components.position must be either 'right' or 'left'");
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

  instantiate: (di) => getStatusBarItems({
    registrations: di.injectMany(statusBarItemInjectionToken),
  }),

});

export default statusBarItemsInjectable;

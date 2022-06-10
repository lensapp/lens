/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type {
  StatusBarItemProps,
  StatusBarRegistration,
} from "./status-bar-registration";
import registeredStatusBarItemsInjectable from "./registered-status-bar-items.injectable";
import { AutoUpdateComponent } from "./auto-update-status-bar-item";

export interface StatusBarItems {
  right: React.ComponentType<StatusBarItemProps>[];
  left: React.ComponentType<StatusBarItemProps>[];
}

interface Dependencies {
  registrations: IComputedValue<StatusBarRegistration[]>;
}

function getStatusBarItems({ registrations }: Dependencies): IComputedValue<StatusBarItems> {
  return computed(() => {
    const res: StatusBarItems = {
      left: [],
      right: [],
    };

    // add Lens specific components
    res.left.push(AutoUpdateComponent);

    // add extension-registered components
    for (const registration of registrations.get()) {
      if (!registration || typeof registration !== "object") {
        continue;
      }

      if (registration.item) {
        const { item } = registration;

        // default for old API is "right"
        res.right.push(
          () => (
            <>
              {
                typeof item === "function"
                  ? item()
                  : item
              }
            </>
          ),
        );
      } else if (registration.components) {
        const { position = "right", Item } = registration.components;

        if (position !== "left" && position !== "right") {
          throw new TypeError("StatusBarRegistration.components.position must be either 'right' or 'left'");
        }

        res[position].push(Item);
      }
    }

    // This is done so that the first ones registered are closest to the corner
    res.right.reverse();

    return res;
  });
}

const statusBarItemsInjectable = getInjectable({
  id: "status-bar-items",

  instantiate: (di) => getStatusBarItems({
    registrations: di.inject(registeredStatusBarItemsInjectable),
  }),

});

export default statusBarItemsInjectable;

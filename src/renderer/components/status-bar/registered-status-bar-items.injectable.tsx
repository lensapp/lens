/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed, IComputedValue } from "mobx";
import type { StatusBarItemProps, StatusBarRegistration } from "./status-bar-registration";
import statusBarItemsInjectable from "./status-bar-items.injectable";

export interface RegisteredStatusBarItems {
  right: React.ComponentType<StatusBarItemProps>[];
  left: React.ComponentType<StatusBarItemProps>[];
}

interface Dependencies {
  registrations: IComputedValue<StatusBarRegistration[]>;
}

function getRegisteredStatusBarItems({ registrations }: Dependencies): IComputedValue<RegisteredStatusBarItems> {
  return computed(() => {
    const res: RegisteredStatusBarItems = {
      left: [],
      right: [],
    };

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

const registeredStatusBarItemsInjectable = getInjectable({
  instantiate: (di) => getRegisteredStatusBarItems({
    registrations: di.inject(statusBarItemsInjectable),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default registeredStatusBarItemsInjectable;

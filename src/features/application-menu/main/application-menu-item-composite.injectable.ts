/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemsInjectable from "./application-menu-items.injectable";
import type { Composite } from "./menu-items/get-composite/get-composite";
import getComposite from "./menu-items/get-composite/get-composite";
import { computed } from "mobx";
import { pipeline } from "@ogre-tools/fp";
import { get } from "lodash/fp";
import type { ApplicationMenuItemTypes } from "./menu-items/application-menu-item-injection-token";

export interface MenuItemRoot { id: "root"; kind: "root"; orderNumber: 0 }

const applicationMenuItemCompositeInjectable = getInjectable({
  id: "application-menu-item-composite",

  instantiate: (di) => {
    const menuItems = di.inject(applicationMenuItemsInjectable);

    return computed((): Composite<ApplicationMenuItemTypes | MenuItemRoot> => {
      const items = menuItems.get();

      return pipeline(
        [{ id: "root" as const, kind: "root" as const, orderNumber: 0 as const }, ...items],

        x => getComposite({
          source: x,
          rootId: "root",
          getId: get("id"),
          getParentId: get("parentId"),
        }),
      );
    });
  },
});

export default applicationMenuItemCompositeInjectable;

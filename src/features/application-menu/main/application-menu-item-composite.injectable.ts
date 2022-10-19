/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemsInjectable from "./application-menu-items.injectable";
import type { Composite } from "../../../common/utils/composite/get-composite/get-composite";
import getComposite from "../../../common/utils/composite/get-composite/get-composite";
import { computed } from "mobx";
import { pipeline } from "@ogre-tools/fp";
import type { ApplicationMenuItemTypes } from "./menu-items/application-menu-item-injection-token";
import loggerInjectable from "../../../common/logger.injectable";
import type { RootComposite } from "../../../common/utils/composite/interfaces";
import type { Discriminable } from "../../../common/utils/composable-responsibilities/discriminable/discriminable";
import type { Orderable } from "../../../common/utils/composable-responsibilities/orderable/orderable";

export type MenuItemRoot =
  & Discriminable<"root">
  & RootComposite<"root">
  & Orderable;

const applicationMenuItemCompositeInjectable = getInjectable({
  id: "application-menu-item-composite",

  instantiate: (di) => {
    const menuItems = di.inject(applicationMenuItemsInjectable);
    const logger = di.inject(loggerInjectable);

    return computed((): Composite<ApplicationMenuItemTypes | MenuItemRoot> => {
      const items = menuItems.get();

      return pipeline(
        [
          {
            id: "root" as const,
            parentId: undefined,
            kind: "root" as const,
            orderNumber: 0 as const,
          },

          ...items,
        ],

        (x) => getComposite({
          source: x,

          handleMissingParentIds: ({ missingParentIds }) => {
            logger.error(
              `[MENU]: cannot render menu item for missing parentIds: "${missingParentIds.join('", "')}"`,
            );
          },
        }),
      );
    });
  },
});

export default applicationMenuItemCompositeInjectable;

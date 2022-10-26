/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemsInjectable from "./application-menu-items.injectable";
import type { Composite } from "../../../common/utils/composite/get-composite/get-composite";
import { getCompositeFor } from "../../../common/utils/composite/get-composite/get-composite";
import { computed } from "mobx";
import { pipeline } from "@ogre-tools/fp";
import type { ApplicationMenuItemTypes } from "./menu-items/application-menu-item-injection-token";
import type { RootComposite } from "../../../common/utils/composite/interfaces";
import type { Discriminable } from "../../../common/utils/composable-responsibilities/discriminable/discriminable";
import { orderByOrderNumber } from "../../../common/utils/composable-responsibilities/orderable/orderable";
import logErrorInjectable from "../../../common/log-error.injectable";
import { isShown } from "../../../common/utils/composable-responsibilities/showable/showable";

export type MenuItemRoot = Discriminable<"root"> & RootComposite<"root">;

const applicationMenuItemCompositeInjectable = getInjectable({
  id: "application-menu-item-composite",

  instantiate: (di) => {
    const menuItems = di.inject(applicationMenuItemsInjectable);
    const logError = di.inject(logErrorInjectable);

    return computed((): Composite<ApplicationMenuItemTypes | MenuItemRoot> => {
      const items = menuItems.get();

      return pipeline(
        [
          {
            parentId: undefined,
            id: "root",
            kind: "root",
          } as const,

          ...items,
        ],

        getCompositeFor({
          getId: (x) => x.id,
          getParentId: (x) => x.parentId,
          transformChildren: (children) =>
            pipeline(
              children,
              orderByOrderNumber,
              (children) => children.filter(isShown),
            ),

          handleMissingParentIds: ({ missingParentIds }) => {
            logError(
              `[MENU]: cannot render menu item for missing parentIds: "${missingParentIds.join(
                '", "',
              )}"`,
            );
          },
        }),
      );
    });
  },
});

export default applicationMenuItemCompositeInjectable;

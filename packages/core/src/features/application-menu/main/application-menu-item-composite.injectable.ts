/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemsInjectable from "./application-menu-items.injectable";
import { getCompositeFor } from "../../../common/utils/composite/get-composite/get-composite";
import { computed } from "mobx";
import type { ApplicationMenuItemTypes } from "./menu-items/application-menu-item-injection-token";
import type { RootComposite } from "../../../common/utils/composite/interfaces";
import type { Discriminable } from "../../../common/utils/composable-responsibilities/discriminable/discriminable";
import logErrorInjectable from "../../../common/log-error.injectable";
import { isShown } from "../../../common/utils/composable-responsibilities/showable/showable";
import type { Orderable } from "@k8slens/utilities";
import { byOrderNumber } from "@k8slens/utilities";

export type MenuItemRoot = Discriminable<"root"> & RootComposite<"root"> & Orderable;

const applicationMenuItemCompositeInjectable = getInjectable({
  id: "application-menu-item-composite",

  instantiate: (di) => {
    const menuItems = di.inject(applicationMenuItemsInjectable);
    const logError = di.inject(logErrorInjectable);

    const getComposite = getCompositeFor<ApplicationMenuItemTypes | MenuItemRoot>({
      getId: (x) => x.id,
      getParentId: (x) => x.parentId,
      transformChildren: (children) => (
        [...children]
          .sort(byOrderNumber)
          .filter(isShown)
      ),
      handleMissingParentIds: ({ missingParentIds }) => {
        const ids = missingParentIds.join('", "');

        logError(`[MENU]: cannot render menu item for missing parentIds: "${ids}"`);
      },
    });

    return computed(() => getComposite([
      {
        parentId: undefined,
        id: "root",
        kind: "root",
        orderNumber: -Infinity,
      } as const,
      ...menuItems.get(),
    ]));
  },
});

export default applicationMenuItemCompositeInjectable;

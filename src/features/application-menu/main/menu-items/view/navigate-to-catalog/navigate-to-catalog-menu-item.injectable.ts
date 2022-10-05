/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import navigateToCatalogInjectable from "../../../../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";

const navigateToCatalogMenuItemInjectable = getInjectable({
  id: "navigate-to-catalog-menu-item",

  instantiate: (di) => {
    const navigateToCatalog = di.inject(navigateToCatalogInjectable);

    return {
      parentId: "view",
      id: "navigate-to-catalog",
      orderNumber: 10,
      label: "Catalog",
      accelerator: "Shift+CmdOrCtrl+C",

      click: () => {
        navigateToCatalog();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default navigateToCatalogMenuItemInjectable;

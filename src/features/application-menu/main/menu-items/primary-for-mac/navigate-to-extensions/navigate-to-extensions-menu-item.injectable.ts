/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import navigateToExtensionsInjectable from "../../../../../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";

const navigateToExtensionsMenuItem = getInjectable({
  id: "navigate-to-extensions-menu-item",

  instantiate: (di) => {
    const navigateToExtensions = di.inject(navigateToExtensionsInjectable);

    return {
      parentId: "primary-for-mac",
      id: "navigate-to-extensions",
      orderNumber: 50,
      label: "Extensions",
      accelerator: "CmdOrCtrl+Shift+E",

      click: () => {
        navigateToExtensions();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default navigateToExtensionsMenuItem;

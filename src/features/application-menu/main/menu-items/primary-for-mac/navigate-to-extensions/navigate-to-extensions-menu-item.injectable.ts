/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import navigateToExtensionsInjectable from "../../../../../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";
import isMacInjectable from "../../../../../../common/vars/is-mac.injectable";

const navigateToExtensionsMenuItem = getInjectable({
  id: "navigate-to-extensions-menu-item",

  instantiate: (di) => {
    const navigateToExtensions = di.inject(navigateToExtensionsInjectable);
    const isMac = di.inject(isMacInjectable);

    return {
      parentId: isMac ? "primary-for-mac" : "file",
      id: "navigate-to-extensions",
      orderNumber: isMac ? 50 : 40,
      label: "Extensions",
      accelerator: isMac ? "CmdOrCtrl+Shift+E" : "Ctrl+Shift+E",

      click: () => {
        navigateToExtensions();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default navigateToExtensionsMenuItem;

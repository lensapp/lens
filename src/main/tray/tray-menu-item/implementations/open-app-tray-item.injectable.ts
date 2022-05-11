/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { trayMenuItemInjectionToken } from "../tray-menu-item-injection-token";
import productNameInjectable from "../../../app-paths/app-name/product-name.injectable";
import showApplicationWindowInjectable from "../../../start-main-application/lens-window/show-application-window.injectable";
import { computed } from "mobx";

const openAppTrayItemInjectable = getInjectable({
  id: "open-app-tray-item",

  instantiate: (di) => {
    const productName = di.inject(productNameInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);

    return {
      id: "open-app",
      parentId: null,
      label: computed(() => `Open ${productName}`),
      orderNumber: 10,
      enabled: computed(() => true),
      visible: computed(() => true),

      click: async () => {
        await showApplicationWindow();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default openAppTrayItemInjectable;

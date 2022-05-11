/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import productNameInjectable from "../../../app-paths/app-name/product-name.injectable";
import showApplicationWindowInjectable from "../../../start-main-application/lens-window/show-application-window.injectable";
import showAboutInjectable from "../../../menu/show-about.injectable";
import { trayMenuItemInjectionToken } from "../tray-menu-item-injection-token";
import { computed } from "mobx";

const aboutAppTrayItemInjectable = getInjectable({
  id: "about-app-tray-item",

  instantiate: (di) => {
    const productName = di.inject(productNameInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const showAbout = di.inject(showAboutInjectable);

    return {
      id: "about-app",
      parentId: null,
      orderNumber: 140,
      label: computed(() => `About ${productName}`),
      enabled: computed(() => true),
      visible: computed(() => true),

      click: async () => {
        await showApplicationWindow();

        await showAbout();
      },
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default aboutAppTrayItemInjectable;

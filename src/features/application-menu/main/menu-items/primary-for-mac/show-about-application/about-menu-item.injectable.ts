/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import productNameInjectable from "../../../../../../common/vars/product-name.injectable";
import showAboutInjectable from "./show-about.injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";

const aboutMenuItemInjectable = getInjectable({
  id: "about-menu-item",

  instantiate: (di) => {
    const productName = di.inject(productNameInjectable);
    const showAbout = di.inject(showAboutInjectable);

    return {
      parentId: "primary-for-mac",
      id: "about",
      orderNumber: 10,
      label: `About ${productName}`,

      click() {
        showAbout();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default aboutMenuItemInjectable;

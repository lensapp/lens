/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import navigateToWelcomeInjectable from "../../../../../../common/front-end-routing/routes/welcome/navigate-to-welcome.injectable";

const navigateToWelcomeMenuItem = getInjectable({
  id: "navigate-to-welcome-menu-item",

  instantiate: (di) => {
    const navigateToWelcome = di.inject(navigateToWelcomeInjectable);

    return {
      kind: "clickable-menu-item" as const,
      parentId: "help",
      id: "navigate-to-welcome",
      orderNumber: 10,
      label: "Welcome",

      onClick: () => {
        navigateToWelcome();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default navigateToWelcomeMenuItem;

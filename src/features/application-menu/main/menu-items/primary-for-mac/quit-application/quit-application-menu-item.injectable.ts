/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import stopServicesAndExitAppInjectable from "../../../../../../main/stop-services-and-exit-app.injectable";

const quitApplicationMenuItemInjectable = getInjectable({
  id: "quit-application-menu-item",

  instantiate: (di) => {
    const stopServicesAndExitApp = di.inject(stopServicesAndExitAppInjectable);

    return           {
      id: "quit",
      parentId: "primary-for-mac",
      orderNumber: 140,
      label: "Quit",
      accelerator: "Cmd+Q",

      click: () => {
        stopServicesAndExitApp();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default quitApplicationMenuItemInjectable;

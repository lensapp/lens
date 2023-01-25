/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import stopServicesAndExitAppInjectable from "../../../../../../main/stop-services-and-exit-app.injectable";
import isMacInjectable from "../../../../../../common/vars/is-mac.injectable";

const quitApplicationMenuItemInjectable = getInjectable({
  id: "quit-application-menu-item",

  instantiate: (di) => {
    const stopServicesAndExitApp = di.inject(stopServicesAndExitAppInjectable);
    const isMac = di.inject(isMacInjectable);

    return {
      kind: "clickable-menu-item" as const,
      id: "quit",
      label: "Quit",

      parentId: isMac ? "mac" : "file",
      orderNumber: isMac ? 140 : 70,
      keyboardShortcut: isMac ? "Cmd+Q" : "Alt+F4",

      onClick: () => {
        stopServicesAndExitApp();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default quitApplicationMenuItemInjectable;

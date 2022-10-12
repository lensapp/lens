/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import applicationMenuItemInjectionToken from "../../../../application-menu/main/menu-items/application-menu-item-injection-token";
import processCheckingForUpdatesInjectable from "../../../main/process-checking-for-updates.injectable";
import showApplicationWindowInjectable from "../../../../../main/start-main-application/lens-window/show-application-window.injectable";
import updatingIsEnabledInjectable from "../../../main/updating-is-enabled/updating-is-enabled.injectable";
import isMacInjectable from "../../../../../common/vars/is-mac.injectable";

const checkForUpdatesMenuItemInjectable = getInjectable({
  id: "check-for-updates-menu-item",

  instantiate: (di) => {
    const processCheckingForUpdates = di.inject(
      processCheckingForUpdatesInjectable,
    );

    const showApplicationWindow = di.inject(showApplicationWindowInjectable);

    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);
    const isMac = di.inject(isMacInjectable);

    return {
      kind: "clickable-menu-item" as const,
      id: "check-for-updates",
      parentId: isMac ? "mac" : "help",
      orderNumber: isMac ? 20 : 50,
      label: "Check for updates",
      isShown: updatingIsEnabled,

      onClick: () => {
        // Todo: implement using async/await
        processCheckingForUpdates("application-menu").then(() =>
          showApplicationWindow(),
        );
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default checkForUpdatesMenuItemInjectable;

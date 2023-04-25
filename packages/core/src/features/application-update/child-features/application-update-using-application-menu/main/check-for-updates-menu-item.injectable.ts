/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import applicationMenuItemInjectionToken from "../../../../application-menu/main/menu-items/application-menu-item-injection-token";
import processCheckingForUpdatesInjectable from "../../../main/process-checking-for-updates.injectable";
import showApplicationWindowInjectable from "../../../../../main/start-main-application/lens-window/show-application-window.injectable";
import updatingIsEnabledInjectable from "../../updating-is-enabled/main/updating-is-enabled.injectable";
import isMacInjectable from "../../../../../common/vars/is-mac.injectable";
import showMessagePopupInjectable from "../../../../../main/electron-app/features/show-message-popup.injectable";

const checkForUpdatesMenuItemInjectable = getInjectable({
  id: "check-for-updates-menu-item",

  instantiate: (di) => {
    const processCheckingForUpdates = di.inject(processCheckingForUpdatesInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);
    const isMac = di.inject(isMacInjectable);
    const showMessagePopup = di.inject(showMessagePopupInjectable);

    return {
      kind: "clickable-menu-item" as const,
      id: "check-for-updates",
      parentId: isMac ? "mac" : "help",
      orderNumber: isMac ? 20 : 50,
      label: "Check for Updates...",
      isShown: updatingIsEnabled,

      onClick: async () => {
        const { updateIsReadyToBeInstalled } = await processCheckingForUpdates("application-menu");

        if (updateIsReadyToBeInstalled) {
          await showApplicationWindow();
        } else {
          showMessagePopup(
            "No Updates Available",
            "You're all good",
            "You've got the latest version of Lens,\nthanks for staying on the ball.",
            {
              textWidth: 300,
            },
          );
        }
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default checkForUpdatesMenuItemInjectable;

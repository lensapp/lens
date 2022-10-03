/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import processCheckingForUpdatesInjectable from "../../../../../application-update/main/process-checking-for-updates.injectable";
import showApplicationWindowInjectable from "../../../../../../main/start-main-application/lens-window/show-application-window.injectable";
import updatingIsEnabledInjectable from "../../../../../application-update/main/updating-is-enabled/updating-is-enabled.injectable";

const checkForUpdatesMenuItemInjectable = getInjectable({
  id: "check-for-updates-menu-item",

  instantiate: (di) => {
    const processCheckingForUpdates = di.inject(
      processCheckingForUpdatesInjectable,
    );

    const showApplicationWindow = di.inject(showApplicationWindowInjectable);

    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);

    return {
      parentId: "primary-for-mac",
      id: "check-for-updates",
      orderNumber: 20,
      label: "Check for updates",
      isShown: updatingIsEnabled,

      click: () => {
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

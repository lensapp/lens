/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { trayMenuItemInjectionToken } from "../tray-menu-item-injection-token";
import { computed } from "mobx";
import stopServicesAndExitAppInjectable from "../../../stop-services-and-exit-app.injectable";
import { withErrorSuppression } from "../../../../common/utils/with-error-suppression/with-error-suppression";
import { pipeline } from "@ogre-tools/fp";
import withErrorLoggingInjectable from "../../../../common/utils/with-error-logging/with-error-logging.injectable";

const quitAppTrayItemInjectable = getInjectable({
  id: "quit-app-tray-item",

  instantiate: (di) => {
    const stopServicesAndExitApp = di.inject(stopServicesAndExitAppInjectable);
    const withErrorLoggingFor = di.inject(withErrorLoggingInjectable);

    return {
      id: "quit-app",
      parentId: null,
      orderNumber: 150,
      label: computed(() => "Quit App"),
      enabled: computed(() => true),
      visible: computed(() => true),

      click: pipeline(
        stopServicesAndExitApp,

        withErrorLoggingFor(() => "[TRAY]: Quitting application failed."),

        // TODO: Find out how to improve typing so that instead of
        // x => withErrorSuppression(x) there could only be withErrorSuppression
        (x) => withErrorSuppression(x),
      ),
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default quitAppTrayItemInjectable;

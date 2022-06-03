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
import withErrorLoggingInjectable from "../../../../common/utils/with-error-logging/with-error-logging.injectable";
import { withErrorSuppression } from "../../../../common/utils/with-error-suppression/with-error-suppression";
import { pipeline } from "@ogre-tools/fp";

const aboutAppTrayItemInjectable = getInjectable({
  id: "about-app-tray-item",

  instantiate: (di) => {
    const productName = di.inject(productNameInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);
    const showAbout = di.inject(showAboutInjectable);
    const withErrorLoggingFor = di.inject(withErrorLoggingInjectable);

    return {
      id: "about-app",
      parentId: null,
      orderNumber: 140,
      label: computed(() => `About ${productName}`),
      enabled: computed(() => true),
      visible: computed(() => true),

      click: pipeline(
        async () => {
          await showApplicationWindow();

          await showAbout();
        },

        withErrorLoggingFor(() => "[TRAY]: Opening of show about failed."),

        // TODO: Find out how to improve typing so that instead of
        // x => withErrorSuppression(x) there could only be withErrorSuppression
        (x) => withErrorSuppression(x),
      ),
    };
  },

  injectionToken: trayMenuItemInjectionToken,
});

export default aboutAppTrayItemInjectable;

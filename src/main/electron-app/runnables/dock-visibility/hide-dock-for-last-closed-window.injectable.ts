/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../../../start-main-application/runnable-tokens/before-quit-of-front-end-injection-token";
import electronAppInjectable from "../../electron-app.injectable";
import { lensWindowInjectionToken } from "../../../start-main-application/lens-window/application-window/lens-window-injection-token";
import { pipeline } from "@ogre-tools/fp";
import { filter, isEmpty } from "lodash/fp";

const hideDockForLastClosedWindowInjectable = getInjectable({
  id: "hide-dock-when-there-are-no-windows",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const getLensWindows = () => di.injectMany(lensWindowInjectionToken);

    return {
      run: () => {
        const visibleWindows = pipeline(
          getLensWindows(),
          filter(window => !!window.visible),
        );

        if (isEmpty(visibleWindows)) {
          app.dock?.hide();
        }
      },
    };
  },

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default hideDockForLastClosedWindowInjectable;

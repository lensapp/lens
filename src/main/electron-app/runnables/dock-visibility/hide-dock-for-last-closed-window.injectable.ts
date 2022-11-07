/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { beforeQuitOfFrontEndInjectionToken } from "../../../start-main-application/runnable-tokens/before-quit-of-front-end-injection-token";
import electronAppInjectable from "../../electron-app.injectable";
import { isEmpty } from "lodash/fp";
import getVisibleWindowsInjectable from "../../../start-main-application/lens-window/get-visible-windows.injectable";

const hideDockForLastClosedWindowInjectable = getInjectable({
  id: "hide-dock-when-there-are-no-windows",

  instantiate: (di) => {
    const app = di.inject(electronAppInjectable);
    const getVisibleWindows = di.inject(getVisibleWindowsInjectable);

    return {
      id: "hide-dock-when-there-are-no-windows",
      run: () => {
        const visibleWindows = getVisibleWindows();

        if (isEmpty(visibleWindows)) {
          app.dock?.hide();
        }

        return undefined;
      },
    };
  },

  injectionToken: beforeQuitOfFrontEndInjectionToken,
});

export default hideDockForLastClosedWindowInjectable;

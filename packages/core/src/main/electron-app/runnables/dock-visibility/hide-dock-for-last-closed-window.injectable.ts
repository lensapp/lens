/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { afterQuitOfFrontEndInjectionToken } from "../../../start-main-application/runnable-tokens/phases";
import electronAppInjectable from "../../electron-app.injectable";
import { isEmpty } from "lodash/fp";
import getVisibleWindowsInjectable from "../../../start-main-application/lens-window/get-visible-windows.injectable";

const hideDockForLastClosedWindowInjectable = getInjectable({
  id: "hide-dock-when-there-are-no-windows",

  instantiate: (di) => ({
    run: () => {
      const app = di.inject(electronAppInjectable);
      const getVisibleWindows = di.inject(getVisibleWindowsInjectable);
      const visibleWindows = getVisibleWindows();

      if (isEmpty(visibleWindows)) {
        app.dock?.hide();
      }

      return undefined;
    },
  }),

  injectionToken: afterQuitOfFrontEndInjectionToken,
});

export default hideDockForLastClosedWindowInjectable;

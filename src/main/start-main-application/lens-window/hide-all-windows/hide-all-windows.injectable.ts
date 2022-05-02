/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensWindowInjectionToken } from "../application-window/lens-window-injection-token";

const hideAllWindowsInjectable = getInjectable({
  id: "hide-all-windows",

  instantiate: (di) => () => {
    const lensWindows = di.injectMany(lensWindowInjectionToken);

    lensWindows.forEach((lensWindow) => {
      lensWindow.hide();
    });
  },
});

export default hideAllWindowsInjectable;

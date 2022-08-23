/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { applicationWindowInjectionToken } from "../application-window/application-window-injection-token";

const closeAllWindowsInjectable = getInjectable({
  id: "close-all-windows",

  instantiate: (di) => () => {
    const lensWindows = di.injectMany(applicationWindowInjectionToken);

    lensWindows.forEach((lensWindow) => {
      lensWindow.close();
    });
  },
});

export default closeAllWindowsInjectable;

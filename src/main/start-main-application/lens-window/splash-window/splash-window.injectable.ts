/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { lensWindowInjectionToken } from "../application-window/lens-window-injection-token";
import createLensWindowInjectable from "../application-window/create-lens-window.injectable";

const splashWindowInjectable = getInjectable({
  id: "splash-window",

  instantiate: (di) => {
    const createLensWindow = di.inject(createLensWindowInjectable);

    return createLensWindow({
      id: "splash",
      title: "Loading",
      getContentUrl: () => "static://splash.html",
      defaultWidth: 500,
      defaultHeight: 300,
      resizable: false,
      windowFrameUtilitiesAreShown: false,
      centered: true,
    });
  },

  injectionToken: lensWindowInjectionToken,
});

export default splashWindowInjectable;

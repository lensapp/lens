/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { BrowserWindow } from "electron";
import electronAppInjectable from "../../electron-app/electron-app.injectable";

const resolveSystemProxyWindowInjectable = getInjectable({
  id: "resolve-system-proxy-window",
  instantiate: async (di) => {
    const app = di.inject(electronAppInjectable);

    await app.whenReady();

    const window = new BrowserWindow({
      show: false,
      paintWhenInitiallyHidden: false,
    });

    window.hide();

    return window;
  },
  causesSideEffects: true,
});

export default resolveSystemProxyWindowInjectable;

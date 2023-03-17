/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { BrowserWindowConstructorOptions } from "electron";
import { BrowserWindow } from "electron";

const electronBrowserWindowInjectable = getInjectable({
  id: "electron-browser-window",
  instantiate: () => {
    return (opts: BrowserWindowConstructorOptions) => {
      return new BrowserWindow(opts);
    };
  },
  causesSideEffects: true,
});

export default electronBrowserWindowInjectable;

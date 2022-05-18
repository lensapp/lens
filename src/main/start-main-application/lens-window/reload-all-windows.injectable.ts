/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { webContents } from "electron";

const reloadAllWindowsInjectable = getInjectable({
  id: "reload-all-windows",

  instantiate: () => () => {
    webContents
      .getAllWebContents()
      .filter((wc) => wc.getType() === "window")
      .forEach((wc) => {
        wc.reload();
        wc.clearHistory();
      });
  },

  causesSideEffects: true,
});

export default reloadAllWindowsInjectable;

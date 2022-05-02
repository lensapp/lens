/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import windowStateKeeper from "electron-window-state";

const applicationWindowStateInjectable = getInjectable({
  id: "application-window-state",

  instantiate: () => {
    console.log("asdasd");

    return windowStateKeeper({
      defaultHeight: 900,
      defaultWidth: 1440,
    });
  },
});

export default applicationWindowStateInjectable;

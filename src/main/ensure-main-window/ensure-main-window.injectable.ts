/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import windowManagerInjectable from "../window-manager.injectable";

const ensureMainWindowInjectable = getInjectable({
  id: "ensure-main-window",

  instantiate: (di) => {
    const windowManager = di.inject(windowManagerInjectable);

    return async (showSplash = true) => {
      await windowManager.ensureMainWindow(showSplash);
    };
  },
});

export default ensureMainWindowInjectable;

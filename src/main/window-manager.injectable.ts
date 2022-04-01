/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { WindowManager } from "./window-manager";

const windowManagerInjectable = getInjectable({
  id: "window-manager",

  instantiate: () => {
    WindowManager.resetInstance();

    return WindowManager.createInstance();
  },

  causesSideEffects: true,
});

export default windowManagerInjectable;

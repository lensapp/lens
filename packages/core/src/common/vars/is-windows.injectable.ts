/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import platformInjectable from "./platform.injectable";

const isWindowsInjectable = getInjectable({
  id: "is-windows",

  instantiate: (di) => {
    const platform = di.inject(platformInjectable);

    return platform === "win32";
  },
});

export default isWindowsInjectable;

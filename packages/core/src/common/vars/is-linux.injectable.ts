/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import platformInjectable from "./platform.injectable";

const isLinuxInjectable = getInjectable({
  id: "is-linux",

  instantiate: (di) => {
    const platform = di.inject(platformInjectable);

    return platform === "linux";
  },
});

export default isLinuxInjectable;

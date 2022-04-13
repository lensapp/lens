/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import contextDirInjectable from "./context-dir.injectable";
import isDevelopmentInjectable from "./is-development.injectable";

const lensResourcesDirInjectable = getInjectable({
  id: "lens-resources-dir",

  instantiate: (di) => {
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const contextDir = di.inject(contextDirInjectable);

    return isDevelopment
      ? contextDir
      : (process.resourcesPath ?? contextDir);
  },

  causesSideEffects: true, 
});

export default lensResourcesDirInjectable;

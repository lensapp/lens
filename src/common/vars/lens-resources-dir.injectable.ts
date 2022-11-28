/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isProductionInjectable from "./is-production.injectable";

const lensResourcesDirInjectable = getInjectable({
  id: "lens-resources-dir",

  instantiate: (di) => {
    const isProduction = di.inject(isProductionInjectable);

    return isProduction
      ? process.resourcesPath
      : process.cwd();
  },

  causesSideEffects: true,
});

export default lensResourcesDirInjectable;

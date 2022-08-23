/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isProductionInjectable from "./is-production.injectable";
import normalizedPlatformInjectable from "./normalized-platform.injectable";
import getAbsolutePathInjectable from "../path/get-absolute-path.injectable";
import lensResourcesDirInjectable from "./lens-resources-dir.injectable";

const bundledResourcesDirectoryInjectable = getInjectable({
  id: "bundled-resources-directory",
  instantiate: (di) => {
    const isProduction = di.inject(isProductionInjectable);
    const normalizedPlatform = di.inject(normalizedPlatformInjectable);
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const lensResourcesDir = di.inject(lensResourcesDirInjectable);

    return isProduction
      ? lensResourcesDir
      : getAbsolutePath(lensResourcesDir, "binaries", "client", normalizedPlatform);
  },
});

export default bundledResourcesDirectoryInjectable;

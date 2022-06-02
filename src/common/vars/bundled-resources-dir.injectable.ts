/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import isProductionInjectable from "./is-production.injectable";
import normalizedPlatformInjectable from "./normalized-platform.injectable";

const bundledResourcesDirectoryInjectable = getInjectable({
  id: "bundled-resources-directory",
  instantiate: (di) => {
    const isProduction = di.inject(isProductionInjectable);
    const normalizedPlatform = di.inject(normalizedPlatformInjectable);

    return isProduction
      ? process.resourcesPath
      : path.join(process.cwd(), "binaries", "client", normalizedPlatform);
  },
});

export default bundledResourcesDirectoryInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import bundledResourcesDirectoryInjectable from "./bundled-resources-dir.injectable";
import getAbsolutePathInjectable from "../path/get-absolute-path.injectable";
import normalizedPlatformArchitectureInjectable from "./normalized-platform-architecture.injectable";

const baseBundledBinariesDirectoryInjectable = getInjectable({
  id: "base-bundled-binaries-directory",
  instantiate: (di) => {
    const bundledResourcesDirectory = di.inject(bundledResourcesDirectoryInjectable);
    const normalizedPlatformArchitecture = di.inject(normalizedPlatformArchitectureInjectable);
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);

    return getAbsolutePath(
      bundledResourcesDirectory,
      normalizedPlatformArchitecture,
    );
  },
});

export default baseBundledBinariesDirectoryInjectable;

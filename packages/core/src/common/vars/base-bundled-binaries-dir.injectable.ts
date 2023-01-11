/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import bundledResourcesDirectoryInjectable from "./bundled-resources-dir.injectable";
import normalizedPlatformArchitectureInjectable from "./normalized-platform-architecture.injectable";
import joinPathsInjectable from "../path/join-paths.injectable";

const baseBundledBinariesDirectoryInjectable = getInjectable({
  id: "base-bundled-binaries-directory",
  instantiate: (di) => {
    const bundledResourcesDirectory = di.inject(bundledResourcesDirectoryInjectable);
    const normalizedPlatformArchitecture = di.inject(normalizedPlatformArchitectureInjectable);
    const joinPaths = di.inject(joinPathsInjectable);

    return joinPaths(
      bundledResourcesDirectory,
      normalizedPlatformArchitecture,
    );
  },
});

export default baseBundledBinariesDirectoryInjectable;

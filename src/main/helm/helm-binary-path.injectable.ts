/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getBinaryName } from "../../common/vars";
import getAbsolutePathInjectable from "../../common/path/get-absolute-path.injectable";
import lensResourcesDirInjectable from "../../common/vars/lens-resources-dir.injectable";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";
import isProductionInjectable from "../../common/vars/is-production.injectable";
import normalizedPlatformArchitectureInjectable from "../../common/vars/normalized-platform-architecture.injectable";

const helmBinaryPathInjectable = getInjectable({
  id: "helm-binary-path",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const lensResourcesDir = di.inject(lensResourcesDirInjectable);
    const normalizedPlatform = di.inject(normalizedPlatformInjectable);
    const normalizedPlatformArchitecture = di.inject(normalizedPlatformArchitectureInjectable);
    const isProduction = di.inject(isProductionInjectable);

    const resourcesDir = isProduction
      ? lensResourcesDir
      : getAbsolutePath(lensResourcesDir, "binaries", "client", normalizedPlatform);

    const baseBinariesDir = getAbsolutePath(resourcesDir, normalizedPlatformArchitecture);

    const helmBinaryName = getBinaryName("helm", { forPlatform: normalizedPlatform });

    return getAbsolutePath(baseBinariesDir, helmBinaryName);
  },
});

export default helmBinaryPathInjectable;

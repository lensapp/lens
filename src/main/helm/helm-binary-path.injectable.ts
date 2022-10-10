/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getBinaryName } from "../../common/vars";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";
import baseBundledBinariesDirectoryInjectable from "../../common/vars/base-bundled-binaries-dir.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";

const helmBinaryPathInjectable = getInjectable({
  id: "helm-binary-path",

  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const normalizedPlatform = di.inject(normalizedPlatformInjectable);
    const baseBundledBinariesDirectory = di.inject(baseBundledBinariesDirectoryInjectable);

    const helmBinaryName = getBinaryName("helm", { forPlatform: normalizedPlatform });

    return joinPaths(baseBundledBinariesDirectory, helmBinaryName);
  },
});

export default helmBinaryPathInjectable;

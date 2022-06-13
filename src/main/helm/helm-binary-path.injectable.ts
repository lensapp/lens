/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getBinaryName } from "../../common/vars";
import getAbsolutePathInjectable from "../../common/path/get-absolute-path.injectable";
import normalizedPlatformInjectable from "../../common/vars/normalized-platform.injectable";
import baseBundledBinariesDirectoryInjectable from "../../common/vars/base-bundled-binaries-dir.injectable";

const helmBinaryPathInjectable = getInjectable({
  id: "helm-binary-path",

  instantiate: (di) => {
    const getAbsolutePath = di.inject(getAbsolutePathInjectable);
    const normalizedPlatform = di.inject(normalizedPlatformInjectable);
    const baseBundledBinariesDirectory = di.inject(baseBundledBinariesDirectoryInjectable);

    const helmBinaryName = getBinaryName("helm", { forPlatform: normalizedPlatform });

    return getAbsolutePath(baseBundledBinariesDirectory, helmBinaryName);
  },
});

export default helmBinaryPathInjectable;

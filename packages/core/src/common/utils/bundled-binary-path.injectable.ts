/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import joinPathsInjectable from "../path/join-paths.injectable";
import baseBundledBinariesDirectoryInjectable from "../vars/base-bundled-binaries-dir.injectable";
import binaryNameInjectable from "./binary-name.injectable";

const bundledBinaryPathInjectable = getInjectable({
  id: "bundled-binary-path",
  instantiate: (di, name) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const binaryName = di.inject(binaryNameInjectable, name);
    const baseBundledBinariesDirectory = di.inject(baseBundledBinariesDirectoryInjectable);

    return joinPaths(baseBundledBinariesDirectory, binaryName);
  },
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, binaryName: string) => binaryName,
  }),
});

export default bundledBinaryPathInjectable;

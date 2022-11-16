/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import binaryNameInjectable from "../../common/utils/get-binary-name.injectable";
import baseBundledBinariesDirectoryInjectable from "../../common/vars/base-bundled-binaries-dir.injectable";

const lensK8sProxyPathInjectable = getInjectable({
  id: "lens-k8s-proxy-path",
  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const binaryName = di.inject(binaryNameInjectable, "lens-k8s-proxy");
    const baseBundledBinariesDirectory = di.inject(baseBundledBinariesDirectoryInjectable);

    return joinPaths(baseBundledBinariesDirectory, binaryName);
  },
});

export default lensK8sProxyPathInjectable;

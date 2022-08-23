/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import baseBundledBinariesDirectoryInjectable from "../../common/vars/base-bundled-binaries-dir.injectable";
import kubectlBinaryNameInjectable from "./binary-name.injectable";

const bundledKubectlBinaryPathInjectable = getInjectable({
  id: "bundled-kubectl-binary-path",
  instantiate: (di) => path.join(
    di.inject(baseBundledBinariesDirectoryInjectable),
    di.inject(kubectlBinaryNameInjectable),
  ),
});

export default bundledKubectlBinaryPathInjectable;

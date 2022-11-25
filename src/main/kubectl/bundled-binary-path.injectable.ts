/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import bundledBinaryPathInjectable from "../../common/utils/bundled-binary-path.injectable";

const bundledKubectlBinaryPathInjectable = getInjectable({
  id: "bundled-kubectl-binary-path",
  instantiate: (di) => di.inject(bundledBinaryPathInjectable, "kubectl"),
});

export default bundledKubectlBinaryPathInjectable;

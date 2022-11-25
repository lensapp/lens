/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import bundledBinaryPathInjectable from "../../common/utils/bundled-binary-path.injectable";

const lensK8sProxyPathInjectable = getInjectable({
  id: "lens-k8s-proxy-path",
  instantiate: (di) => di.inject(bundledBinaryPathInjectable, "lens-k8s-proxy"),
});

export default lensK8sProxyPathInjectable;

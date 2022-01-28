/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import clusterManagerInjectable from "./cluster-manager.injectable";

const getClusterForRequestInjectable = getInjectable({
  instantiate: (di) => di.inject(clusterManagerInjectable).getClusterForRequest,
  lifecycle: lifecycleEnum.singleton,
});

export default getClusterForRequestInjectable;

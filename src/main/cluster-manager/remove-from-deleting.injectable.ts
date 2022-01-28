/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import clusterManagerInjectable from "./cluster-manager.injectable";

const removeFromDeletingInjectable = getInjectable({
  instantiate: (di) => di.inject(clusterManagerInjectable).removeFromDeleting,
  lifecycle: lifecycleEnum.singleton,
});

export default removeFromDeletingInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import detectorRegistryInjectable from "./detector-registry.injectable";

const detectMetadataForClusterInjectable = getInjectable({
  instantiate: (di) => di.inject(detectorRegistryInjectable).detectForCluster,
  lifecycle: lifecycleEnum.singleton,
});

export default detectMetadataForClusterInjectable;

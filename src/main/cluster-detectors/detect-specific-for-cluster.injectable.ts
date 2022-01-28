/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../common/utils";
import detectorRegistryInjectable from "./detector-registry.injectable";

interface Args {
  key: string;
}

const detectSpecificForClusterInjectable = getInjectable({
  instantiate: (di, { key }: Args) => bind(di.inject(detectorRegistryInjectable).detectSpecificForCluster, null, key),
  lifecycle: lifecycleEnum.transient,
});

export default detectSpecificForClusterInjectable;

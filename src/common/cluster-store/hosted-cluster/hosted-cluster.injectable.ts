/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { getHostedClusterId } from "../../utils";
import clusterStoreInjectable from "../cluster-store.injectable";

const hostedClusterInjectable = getInjectable({
  instantiate: (di) => {
    const hostedClusterId = getHostedClusterId();

    return di.inject(clusterStoreInjectable).getById(hostedClusterId);
  },

  lifecycle: lifecycleEnum.singleton,
});

export default hostedClusterInjectable;

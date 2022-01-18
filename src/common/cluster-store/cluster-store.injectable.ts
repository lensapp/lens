/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ClusterStore } from "./cluster-store";
import { createClusterInjectionToken } from "../cluster/create-cluster-injection-token";

const clusterStoreInjectable = getInjectable({
  instantiate: (di) =>
    ClusterStore.createInstance({
      createCluster: di.inject(createClusterInjectionToken),
    }),

  lifecycle: lifecycleEnum.singleton,
});

export default clusterStoreInjectable;

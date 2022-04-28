/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createClusterInjectionToken } from "./create-cluster-injection-token";
import { ClusterStore } from "./store";

const clusterStoreInjectable = getInjectable({
  id: "cluster-store",

  instantiate: (di) => {
    ClusterStore.resetInstance();

    return ClusterStore.createInstance({
      createCluster: di.inject(createClusterInjectionToken),
    });
  },

  causesSideEffects: true,
});

export default clusterStoreInjectable;

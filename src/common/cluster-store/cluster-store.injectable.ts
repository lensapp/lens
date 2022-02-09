/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterStore } from "./cluster-store";
import { createClusterInjectionToken } from "../cluster/create-cluster-injection-token";

const clusterStoreInjectable = getInjectable({
  id: "cluster-store",

  instantiate: (di) =>
    ClusterStore.createInstance({
      createCluster: di.inject(createClusterInjectionToken),
    }),
});

export default clusterStoreInjectable;

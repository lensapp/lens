/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { ClusterStore } from "./store";
import { createClusterInjectionToken } from "../cluster/create-cluster-injection-token";
import { clusterStoreMigrationsInjectionToken } from "./migrations-injection-token";

const clusterStoreInjectable = getInjectable({
  instantiate: (di) => new ClusterStore({
    createCluster: di.inject(createClusterInjectionToken),
    migrations: di.inject(clusterStoreMigrationsInjectionToken),
  }),

  lifecycle: lifecycleEnum.singleton,
});

export default clusterStoreInjectable;

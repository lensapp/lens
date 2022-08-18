/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getGlobalOverride } from "../test-utils/get-global-override";
import clusterStoreInjectable from "./cluster-store.injectable";
import type { Cluster } from "../cluster/cluster";
import { observable } from "mobx";
import type { ClusterId } from "../cluster-types";
import type { ClusterStore } from "./cluster-store";

export default getGlobalOverride(
  clusterStoreInjectable,
  () => {
    const clusters = observable.map<ClusterId, Cluster>();

    return {
      displayName: "ClusterStore",
      provideInitialFromMain: () => {},
      loadInitialOnRenderer: async () => {},
      pushStateToViewsAutomatically: () => {},
      registerIpcListener: () => {},
      unregisterIpcListener: () => {},
      pushState: () => {},
      getById: (id) => clusters.get(id),
      get clustersList() {
        return Array.from(clusters.values());
      },
      get connectedClustersList() {
        return Array.from(clusters.values()).filter(c => !c.disconnected);
      },
      hasClusters: () => clusters.size > 0,
      addCluster: () => { throw new Error("addCluster is not yet supported"); },
      clusters,
    } as Partial<ClusterStore> as ClusterStore;
  },
);

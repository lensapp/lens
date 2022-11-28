/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import type { ClusterContext } from "./cluster-frame-context";
import hostedClusterInjectable from "./hosted-cluster.injectable";

const clusterFrameContextForClusterScopedResourcesInjectable = getInjectable({
  id: "cluster-frame-context-for-cluster-scoped-resources",
  instantiate: (di): ClusterContext => {
    const cluster = di.inject(hostedClusterInjectable);

    assert(cluster, "This can only be injected within a cluster frame");

    return {
      isGlobalWatchEnabled: () => cluster.isGlobalWatchEnabled,
      // This is always the case for cluster scoped resources
      isLoadingAll: () => true,
      isNamespaceListStatic: () => cluster.accessibleNamespaces.length > 0,
      allNamespaces: [],
      contextNamespaces: [], // This value is used as a sentinal
      hasSelectedAll: true,
    };
  },
});

export default clusterFrameContextForClusterScopedResourcesInjectable;

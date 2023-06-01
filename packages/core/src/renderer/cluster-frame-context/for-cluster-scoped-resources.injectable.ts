/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { clusterFrameContextForClusterScopedResourcesInjectionToken } from "@k8slens/cluster-frame-context";
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterContext } from "@k8slens/cluster-frame-context";

const clusterFrameContextForClusterScopedResourcesInjectable = getInjectable({
  id: "cluster-frame-context-for-cluster-scoped-resources",
  instantiate: (): ClusterContext => ({
    // This doesn't matter as it is an optimization for namespaced resources only
    isGlobalWatchEnabled: () => true,
    // This is always the case for cluster scoped resources
    isLoadingAll: () => true,
    allNamespaces: [],
    contextNamespaces: [],
    hasSelectedAll: true,
  }),
  injectionToken: clusterFrameContextForClusterScopedResourcesInjectionToken,
});

export default clusterFrameContextForClusterScopedResourcesInjectable;

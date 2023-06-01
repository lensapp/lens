/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterContext } from "./types";

export const clusterFrameContextForClusterScopedResourcesInjectionToken = getInjectionToken<ClusterContext>({
  id: "cluster-frame-context-for-cluster-scoped-resources-injection-token",
});

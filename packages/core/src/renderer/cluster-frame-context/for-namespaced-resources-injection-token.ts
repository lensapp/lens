/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterContext } from "./cluster-frame-context";

export const clusterFrameContextForNamespacedResourcesInjectionToken = getInjectionToken<ClusterContext>({
  id: "cluster-frame-context-for-namespaced-resources-injection-token",
});

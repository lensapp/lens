/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { ClusterStore } from "../cluster-store/cluster-store";
import type { KubeResource } from "../rbac";
import { getHostedClusterId } from "./cluster-id-url-parsing";

export function isAllowedResource(resource: KubeResource | KubeResource[]) {
  const resources = [resource].flat();
  const cluster = ClusterStore.getInstance().getById(getHostedClusterId());

  if (!cluster?.allowedResources) {
    return false;
  }

  if (resources.length === 0) {
    return true;
  }

  const allowedResources = new Set(cluster.allowedResources);

  return resources.every(resource => allowedResources.has(resource));
}

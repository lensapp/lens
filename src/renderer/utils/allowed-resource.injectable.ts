/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Cluster } from "../../common/cluster/cluster";
import type { KubeResource } from "../../common/rbac";
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { bind } from "../../common/utils";
import hostedClusterInjectable from "../../common/cluster-store/hosted-cluster/hosted-cluster.injectable";

interface Dependencies {
  activeCluster: Cluster;
}

function isAllowedResource({ activeCluster }: Dependencies, resource: KubeResource | KubeResource[]) {
  const resources = [resource].flat();

  if (!activeCluster?.allowedResources) {
    return false;
  }

  if (resources.length === 0) {
    return true;
  }

  const allowedResources = new Set(activeCluster.allowedResources);

  return resources.every(resource => allowedResources.has(resource));
}

const isAllowedResourceInjectable = getInjectable({
  instantiate: (di) => bind(isAllowedResource, null, {
    activeCluster: di.inject(hostedClusterInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default isAllowedResourceInjectable;


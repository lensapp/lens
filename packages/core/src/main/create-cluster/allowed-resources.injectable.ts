/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { shouldShowResourceInjectionToken } from "../../features/cluster/showing-kube-resources/common/allowed-resources-injection-token";
import type { KubeApiResourceDescriptor } from "../../common/rbac";
import { formatKubeApiResource } from "../../common/rbac";

// TODO: Figure out implementation for this later.
const allowedResourcesInjectable = getInjectable({
  id: "allowed-resources",
  instantiate: () => computed(() => false),
  injectionToken: shouldShowResourceInjectionToken,
  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, resource: KubeApiResourceDescriptor) => formatKubeApiResource(resource),
  }),
});

export default allowedResourcesInjectable;

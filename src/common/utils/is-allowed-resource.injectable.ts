/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { KubeResource } from "../rbac";
import { allowedResourcesInjectionToken } from "../cluster-store/allowed-resources-injection-token";

export type IsAllowedResource = (resource: KubeResource) => boolean;

const isAllowedResourceInjectable = getInjectable({
  id: "is-allowed-resource",

  instantiate: (di, resourceName: string) => {
    const allowedResources = di.inject(allowedResourcesInjectionToken);

    return computed(() => allowedResources.get().has(resourceName));
  },

  lifecycle: lifecycleEnum.keyedSingleton({
    getInstanceKey: (di, resource: string) => resource,
  }),
});

export default isAllowedResourceInjectable;

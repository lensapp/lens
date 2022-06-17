/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { comparer, computed } from "mobx";
import hostedClusterInjectable from "./hosted-cluster.injectable";
import { allowedResourcesInjectionToken } from "../../common/cluster-store/allowed-resources-injection-token";

const allowedResourcesInjectable = getInjectable({
  id: "allowed-resources",

  instantiate: (di) => {
    const cluster = di.inject(hostedClusterInjectable);

    return computed(() => new Set(cluster?.allowedResources), {
      // This needs to be here so that during refresh changes are only propogated when necessary
      equals: (cur, prev) => comparer.structural(cur, prev),
    });
  },

  injectionToken: allowedResourcesInjectionToken,
});

export default allowedResourcesInjectable;

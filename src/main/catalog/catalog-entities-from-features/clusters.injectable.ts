/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computedInjectManyInjectable } from "@ogre-tools/injectable-extension-for-mobx";
import { computed } from "mobx";
import { clusterInjectionToken } from "@lensapp/catalog";

const clustersInjectable = getInjectable({
  id: "clusters",

  instantiate: (di) => {
    const computedInjectMany = di.inject(computedInjectManyInjectable);
    const clusters = computedInjectMany(clusterInjectionToken);

    return computed(() => clusters.get());
  },
});

export default clustersInjectable;

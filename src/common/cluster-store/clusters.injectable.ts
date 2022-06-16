/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import clusterStoreInjectable from "./cluster-store.injectable";

const clustersInjectable = getInjectable({
  id: "clusters",
  instantiate: (di) => {
    const store = di.inject(clusterStoreInjectable);

    return computed(() => [...store.clusters.values()]);
  },
});

export default clustersInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { computed } from "mobx";
import hostedClusterInjectable from "./hosted-cluster.injectable";

const globalWatchEnabledInjectable = getInjectable({
  id: "global-watch-enabled",
  instantiate: (di) => {
    const cluster = di.inject(hostedClusterInjectable);

    assert(cluster, "This can only be injected within a cluster frame");

    return computed(() => cluster.isGlobalWatchEnabled);
  },
});

export default globalWatchEnabledInjectable;

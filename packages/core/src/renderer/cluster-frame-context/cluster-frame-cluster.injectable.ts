/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import hostedClusterInjectable from "./hosted-cluster.injectable";

const clusterFrameClusterInjectable = getInjectable({
  id: "cluster-frame-cluster",
  instantiate: (di) => {
    const cluster = di.inject(hostedClusterInjectable);

    assert(cluster, "This can only be injected within a cluster frame");

    return cluster;
  },
});

export default clusterFrameClusterInjectable;

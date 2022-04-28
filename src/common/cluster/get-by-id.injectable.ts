/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterStoreInjectable from "./store.injectable";
import type { Cluster } from "./cluster";
import type { ClusterId } from "./types";

export type GetClusterById = (id: ClusterId) => Cluster | undefined;

const getClusterByIdInjectable = getInjectable({
  id: "get-cluster-by-id",
  instantiate: (di): GetClusterById => {
    const store = di.inject(clusterStoreInjectable);

    return (id) => store.getById(id);
  },
});

export default getClusterByIdInjectable;

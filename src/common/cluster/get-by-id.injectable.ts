/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../cluster-types";
import type { Cluster } from "./cluster";
import { getInjectable } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../cluster-store/cluster-store.injectable";

export type GetClusterById = (id: ClusterId) => Cluster | undefined;

const getClusterByIdInjectable = getInjectable({
  id: "get-cluster-by-id",
  instantiate: (di): GetClusterById => {
    const store = di.inject(clusterStoreInjectable);

    return (id) => store.getById(id);
  },
});

export default getClusterByIdInjectable;

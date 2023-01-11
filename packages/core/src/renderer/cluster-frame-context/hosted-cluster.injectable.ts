/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hostedClusterIdInjectable from "./hosted-cluster-id.injectable";
import clusterStoreInjectable from "../../common/cluster-store/cluster-store.injectable";

const hostedClusterInjectable = getInjectable({
  id: "hosted-cluster",

  instantiate: (di) => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);
    const store = di.inject(clusterStoreInjectable);

    return store.getById(hostedClusterId);
  },
});

export default hostedClusterInjectable;

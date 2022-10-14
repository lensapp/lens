/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hostedClusterIdInjectable from "./hosted-cluster-id.injectable";
import getClusterByIdInjectable from "../../common/cluster-store/get-by-id.injectable";

const hostedClusterInjectable = getInjectable({
  id: "hosted-cluster",

  instantiate: (di) => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);
    const getClusterById = di.inject(getClusterByIdInjectable);

    if (!hostedClusterId) {
      return undefined;
    }

    return getClusterById(hostedClusterId);
  },
});

export default hostedClusterInjectable;

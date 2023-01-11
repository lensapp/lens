/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import getActiveClusterEntityInjectable from "../../../api/catalog/entity/get-active-cluster-entity.injectable";

const clusterInjectable = getInjectable({
  id: "cluster",
  instantiate: (di) => {
    const getActiveClusterEntity = di.inject(getActiveClusterEntityInjectable);

    return getActiveClusterEntity();
  },
  lifecycle: lifecycleEnum.transient,
});

export default clusterInjectable;

/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import activeEntityInternalClusterInjectable from "../../api/catalog/entity/get-active-cluster-entity.injectable";

const clusterNameInjectable = getInjectable({
  id: "cluster-name",
  instantiate: (di) => {
    const activeEntityInternalCluster = di.inject(activeEntityInternalClusterInjectable);

    return computed(() => activeEntityInternalCluster.get()?.name.get());
  },
});

export default clusterNameInjectable;

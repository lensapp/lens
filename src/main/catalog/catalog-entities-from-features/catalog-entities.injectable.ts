/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import catalogEntityForClusterInjectable from "./catalog-entity-for-cluster.injectable";
import type { Cluster } from "@lensapp/cluster";
import { clustersInjectionToken } from "@lensapp/cluster";

const catalogEntitiesInjectable = getInjectable({
  id: "catalog-entities",

  instantiate: (di) => {
    const clusters = di.inject(clustersInjectionToken);

    const getCatalogEntity = (cluster: Cluster) =>
      di.inject(catalogEntityForClusterInjectable, cluster);

    return computed(() => clusters.get().map(getCatalogEntity));
  },
});

export default catalogEntitiesInjectable;

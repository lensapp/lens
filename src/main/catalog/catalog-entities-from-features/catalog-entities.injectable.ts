/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { ClusterDto } from "./clusters.injectable";
import clustersInjectable from "./clusters.injectable";
import catalogEntityForClusterInjectable from "./catalog-entity-for-cluster.injectable";

const catalogEntitiesInjectable = getInjectable({
  id: "catalog-entities",

  instantiate: (di) => {
    const clusters = di.inject(clustersInjectable);

    const getCatalogEntity = (cluster: ClusterDto) =>
      di.inject(catalogEntityForClusterInjectable, cluster);

    return computed(() => clusters.get().map(getCatalogEntity));
  },
});

export default catalogEntitiesInjectable;

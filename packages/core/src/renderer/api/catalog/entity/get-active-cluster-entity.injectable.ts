/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import catalogEntityRegistryInjectable from "./registry.injectable";

const activeEntityInternalClusterInjectable = getInjectable({
  id: "active-entity-internal-cluster",
  instantiate: (di) => {
    const store = di.inject(clusterStoreInjectable);
    const entityRegistry = di.inject(catalogEntityRegistryInjectable);

    return computed(() => store.getById(entityRegistry.activeEntity?.getId()));
  },
});

export default activeEntityInternalClusterInjectable;

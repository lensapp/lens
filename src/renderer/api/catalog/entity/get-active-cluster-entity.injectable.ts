/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import type { Cluster } from "../../../../common/cluster/cluster";
import catalogEntityRegistryInjectable from "./registry.injectable";

export type GetActiveClusterEntity = () => Cluster | undefined;

const getActiveClusterEntityInjectable = getInjectable({
  id: "get-active-cluster-entity",
  instantiate: (di): GetActiveClusterEntity => {
    const store = di.inject(clusterStoreInjectable);
    const entityRegistry = di.inject(catalogEntityRegistryInjectable);

    return () => {
      const entityId = entityRegistry.activeEntity?.getId();

      if (!entityId) {
        return undefined;
      }

      return store.getById(entityId);
    };
  },
});

export default getActiveClusterEntityInjectable;

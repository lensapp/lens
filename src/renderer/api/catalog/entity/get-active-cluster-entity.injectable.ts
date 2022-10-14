/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getClusterByIdInjectable from "../../../../common/cluster-store/get-by-id.injectable";
import type { Cluster } from "../../../../common/cluster/cluster";
import catalogEntityRegistryInjectable from "./registry.injectable";

export type GetActiveClusterEntity = () => Cluster | undefined;

const getActiveClusterEntityInjectable = getInjectable({
  id: "get-active-cluster-entity",
  instantiate: (di): GetActiveClusterEntity => {
    const getClusterById = di.inject(getClusterByIdInjectable);
    const entityRegistry = di.inject(catalogEntityRegistryInjectable);

    return () => {
      const clusterId = entityRegistry.activeEntity?.getId();

      if (!clusterId) {
        return undefined;
      }

      return getClusterById(clusterId);
    };
  },
});

export default getActiveClusterEntityInjectable;

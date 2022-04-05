/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterManager } from "./cluster-manager";
import clusterStoreInjectable from "../common/cluster-store/cluster-store.injectable";
import catalogEntityRegistryInjectable from "./catalog/entity-registry.injectable";

const clusterManagerInjectable = getInjectable({
  id: "cluster-manager",

  instantiate: (di) => {
    const clusterManager = new ClusterManager({
      store: di.inject(clusterStoreInjectable),
      entityRegistry: di.inject(catalogEntityRegistryInjectable),
    });

    clusterManager.init();

    return clusterManager;
  },
});

export default clusterManagerInjectable;

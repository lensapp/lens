/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import clusterStoreInjectable from "../../common/cluster-store/store.injectable";
import catalogEntityRegistryInjectable from "../catalog/entity-registry.injectable";
import { ClusterManager } from "./cluster-manager";

const clusterManagerInjectable = getInjectable({
  instantiate: (di) => new ClusterManager({
    clusterStore: di.inject(clusterStoreInjectable),
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
  }),
  lifecycle: lifecycleEnum.singleton,
});

export default clusterManagerInjectable;

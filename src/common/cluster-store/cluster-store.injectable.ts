/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterStore } from "./cluster-store";
import { createClusterInjectionToken } from "../cluster/create-cluster-injection-token";
import readClusterConfigSyncInjectable from "./read-cluster-config.injectable";
import emitAppEventInjectable from "../app-event-bus/emit-event.injectable";

const clusterStoreInjectable = getInjectable({
  id: "cluster-store",

  instantiate: (di) => {
    ClusterStore.resetInstance();

    return ClusterStore.createInstance({
      createCluster: di.inject(createClusterInjectionToken),
      readClusterConfigSync: di.inject(readClusterConfigSyncInjectable),
      emitAppEvent: di.inject(emitAppEventInjectable),
    });
  },

  causesSideEffects: true,
});

export default clusterStoreInjectable;

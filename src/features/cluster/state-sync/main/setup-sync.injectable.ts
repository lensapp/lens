/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../../../main/start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import initClusterStoreInjectable from "../../store/main/init.injectable";
import emitClusterStateUpdateInjectable from "./emit-update.injectable";

const setupClusterStateBroadcastingInjectable = getInjectable({
  id: "setup-cluster-state-broadcasting",
  instantiate: (di) => {
    const emitClusterStateUpdate = di.inject(emitClusterStateUpdateInjectable);
    const clusterStore = di.inject(clusterStoreInjectable);

    return {
      id: "setup-cluster-state-broadcasting",
      run: () => {
        reaction(() => clusterStore.connectedClustersList, () => {
          for (const cluster of clusterStore.clusters.values()) {
            emitClusterStateUpdate({
              clusterId: cluster.id,
              state: cluster.getState(),
            });
          }
        });
      },
      runAfter: di.inject(initClusterStoreInjectable),
    };
  },
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupClusterStateBroadcastingInjectable;

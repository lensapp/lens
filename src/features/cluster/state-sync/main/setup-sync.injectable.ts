/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { isEqual } from "lodash";
import { autorun } from "mobx";
import clusterStoreInjectable from "../../../../common/cluster-store/cluster-store.injectable";
import type { ClusterId, ClusterState } from "../../../../common/cluster-types";
import { beforeApplicationIsLoadingInjectionToken } from "../../../../main/start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import initClusterStoreInjectable from "../../store/main/init.injectable";
import emitClusterStateUpdateInjectable from "./emit-update.injectable";

const setupClusterStateBroadcastingInjectable = getInjectable({
  id: "setup-cluster-state-broadcasting",
  instantiate: (di) => ({
    id: "setup-cluster-state-broadcasting",
    run: () => {
      const emitClusterStateUpdate = di.inject(emitClusterStateUpdateInjectable);
      const clusterStore = di.inject(clusterStoreInjectable);
      const prevStates = new Map<ClusterId, ClusterState>();

      autorun(() => {
        for (const cluster of clusterStore.clusters.values()) {
          const prevState = prevStates.get(cluster.id);
          const curState = cluster.getState();

          if (!prevState || !isEqual(prevState, curState)) {
            prevStates.set(cluster.id, curState);

            emitClusterStateUpdate({
              clusterId: cluster.id,
              state: cluster.getState(),
            });
          }
        }
      });
    },
    runAfter: di.inject(initClusterStoreInjectable),
  }),
  injectionToken: beforeApplicationIsLoadingInjectionToken,
});

export default setupClusterStateBroadcastingInjectable;
